import time
import warnings
import requests
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor

warnings.filterwarnings('ignore')

# —— 配置 ——
API_BASE_URL = "https://data.melbourne.vic.gov.au/api/explore/v2.1/catalog/datasets/on-street-parking-bay-sensors/records"
PREDICT_HOURS_DEFAULT = 24
MAX_RECORDS = 1000


# =========================
#  数据获取与清洗（原样整合）
# =========================
def fetch_api_data(zone_filter: str = "", max_records: int = 1000):
    """从 API 获取实时停车数据，支持分页"""
    try:
        all_records = []
        offset = 0
        limit = 99  # API 限制每次99条

        while len(all_records) < max_records:
            params = {
                'order_by': 'lastupdated desc',
                'limit': limit,
                'offset': offset
            }
            if zone_filter:
                params['where'] = f'zone_number="{zone_filter}"'

            response = requests.get(API_BASE_URL, params=params, timeout=30)
            if response.status_code != 200:
                break

            data = response.json()
            if 'results' not in data or not data['results']:
                break

            records = data['results']
            all_records.extend(records)

            if len(records) < limit:
                break

            offset += limit
            time.sleep(0.5)

        return all_records

    except requests.exceptions.RequestException:
        return []
    except Exception:
        return []


def parse_api_records(records):
    """解析 API 返回的记录为 DataFrame"""
    try:
        if not records:
            return pd.DataFrame()

        parsed_data = []
        for record in records:
            parsed_record = {
                'Status_Timestamp': '',
                'Status_Description': '',
                'KerbsideID': '',
                'Location': '',
                'Zone_Number': '',
            }
            field_mappings = {
                'Status_Timestamp': ['lastupdated', 'updated_at', 'timestamp', 'date_time'],
                'Status_Description': ['status', 'bay_status', 'description', 'state'],
                'KerbsideID': ['bay_id', 'id', 'kerbside_id', 'sensor_id'],
                'Location': ['location', 'address', 'street'],
                'Zone_Number': ['zone_number', 'zone', 'zone_id']
            }
            for target_field, possible_sources in field_mappings.items():
                for source_field in possible_sources:
                    if source_field in record and record[source_field]:
                        parsed_record[target_field] = str(record[source_field])
                        break

            if not parsed_record['Status_Timestamp']:
                for key, value in record.items():
                    if any(w in key.lower() for w in ['time', 'date', 'update']):
                        parsed_record['Status_Timestamp'] = str(value)
                        break

            if not parsed_record['KerbsideID']:
                for key, value in record.items():
                    if any(w in key.lower() for w in ['id', 'bay', 'sensor']):
                        parsed_record['KerbsideID'] = str(value)
                        break

            parsed_data.append(parsed_record)

        df = pd.DataFrame(parsed_data)
        return df

    except Exception:
        return pd.DataFrame()


def load_and_clean_data(zone_filter: str = "") -> pd.Series:
    """
    拉取并整理数据 -> 返回按小时聚合的 Series(index=小时，值=唯一车位数）
    """
    try:
        api_records = fetch_api_data(zone_filter, MAX_RECORDS)
        if not api_records:
            return pd.Series(dtype=float)

        df = parse_api_records(api_records)
        if df.empty:
            return pd.Series(dtype=float)

        df = df[df['Status_Timestamp'].astype(str).str.len() > 0]
        df = df[df['KerbsideID'].astype(str).str.len() > 0]
        if df.empty:
            return pd.Series(dtype=float)

        if zone_filter and 'Zone_Number' in df.columns:
            df_filtered = df[df['Zone_Number'].astype(str) == zone_filter]
            if not df_filtered.empty:
                df = df_filtered

        df["datetime"] = pd.to_datetime(df["Status_Timestamp"], errors='coerce', utc=True)
        df = df.dropna(subset=['datetime'])
        if df.empty:
            return pd.Series(dtype=float)

        df = df.sort_values("datetime")
        df["hour"] = df["datetime"].dt.floor("H")
        hourly_counts = df.groupby("hour")["KerbsideID"].nunique()

        if len(hourly_counts) < 24:
            # 合成 3 天数据增强样本
            end_time = hourly_counts.index.max() if not hourly_counts.empty else pd.Timestamp.now(tz='UTC')
            start_time = end_time - pd.Timedelta(days=3)
            full_hours = pd.date_range(start=start_time, end=end_time, freq='H')

            if not hourly_counts.empty:
                base_count = hourly_counts.mean()
                std_count = hourly_counts.std() if hourly_counts.std() == hourly_counts.std() else 5
            else:
                base_count = 20
                std_count = 5

            synthetic_data = {}
            for hour_dt in full_hours:
                hour_of_day = hour_dt.hour
                daily_factor = 0.8 + 0.4 * np.sin(2 * np.pi * (hour_of_day - 6) / 24)
                weekly_factor = 0.9 if hour_dt.weekday() < 5 else 1.1
                noise = np.random.normal(0, std_count * 0.3)
                synthetic_count = base_count * daily_factor * weekly_factor + noise
                synthetic_data[hour_dt] = max(1, int(synthetic_count))

            synthetic_series = pd.Series(synthetic_data)
            for real_hour, real_count in hourly_counts.items():
                synthetic_series[real_hour] = real_count

            hourly_counts = synthetic_series.sort_index()

        else:
            full_hours = pd.date_range(
                start=hourly_counts.index.min(),
                end=hourly_counts.index.max(),
                freq='H'
            )
            hourly_counts = hourly_counts.reindex(full_hours).fillna(method='ffill')

        return hourly_counts

    except Exception:
        return pd.Series(dtype=float)


# =========================
#   特征与预测（原样整合）
# =========================
def create_features(ts: pd.Series):
    features, targets = [], []
    for i in range(len(ts)):
        dt = ts.index[i]
        hour_of_day = dt.hour
        day_of_week = dt.dayofweek
        is_weekend = 1 if dt.dayofweek >= 5 else 0

        recent_values = []
        for lag in [1, 2, 3, 6, 12, 24]:
            if i >= lag:
                recent_values.append(ts.iloc[i - lag])
            else:
                recent_values.append(ts.iloc[0])

        feature_row = [hour_of_day, day_of_week, is_weekend] + recent_values
        features.append(feature_row)
        targets.append(ts.iloc[i])

    return np.array(features), np.array(targets)


def forecast_with_ml(ts: pd.Series, prediction_length: int):
    """返回:predictions, lower_bound, upper_bound, model_name"""
    try:
        if len(ts) < 50:
            recent_mean = ts.tail(min(24, len(ts))).mean()
            recent_std = ts.tail(min(24, len(ts))).std()
            if np.isnan(recent_std):
                recent_std = 1.0

            predictions = []
            for h in range(prediction_length):
                hour_factor = 0.9 + 0.2 * np.sin(2 * np.pi * h / 24)
                pred = recent_mean * hour_factor + np.random.normal(0, recent_std * 0.1)
                predictions.append(max(0, pred))
            predictions = np.array(predictions)
            lower_bound = predictions * 0.8
            upper_bound = predictions * 1.2
            return predictions, lower_bound, upper_bound, "Simple-Pattern"

        # 使用随机森林
        X, y = create_features(ts)
        train_size = int(len(X) * 0.8)
        X_train, y_train = X[:train_size], y[:train_size]

        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)

        predictions = []
        current_ts = ts.copy()

        for _ in range(prediction_length):
            last_dt = current_ts.index[-1] + pd.Timedelta(hours=1)
            hour_of_day = last_dt.hour
            day_of_week = last_dt.dayofweek
            is_weekend = 1 if last_dt.dayofweek >= 5 else 0

            recent_values = []
            for lag in [1, 2, 3, 6, 12, 24]:
                if len(current_ts) >= lag:
                    recent_values.append(current_ts.iloc[-lag])
                else:
                    recent_values.append(current_ts.iloc[-1])

            feature_row = np.array([[hour_of_day, day_of_week, is_weekend] + recent_values])
            pred = model.predict(feature_row)[0]
            pred = max(0, pred)
            predictions.append(pred)
            current_ts = pd.concat([current_ts, pd.Series([pred], index=[last_dt])])

        predictions = np.array(predictions)
        historical_std = ts.std() if not np.isnan(ts.std()) else 1.0
        lower_bound = predictions - 1.645 * historical_std * 0.3
        upper_bound = predictions + 1.645 * historical_std * 0.3
        return predictions, lower_bound, upper_bound, "RandomForest-ML"

    except Exception:
        return None, None, None, None


# =========================
#   统一出口：给 API 用
# =========================
def predict_parking(zone_filter: str = "", predict_hours: int = PREDICT_HOURS_DEFAULT):
    """
    返回包含历史序列 + 预测序列的 JSON 对象（字典）
    {
      ok: true,
      model: "...",
      zone: "...",
      history: {
        points, avg, min, max,
        series: [{time, y}, ...]        ← 前端画历史蓝线用
      },
      predictions: [{time, y, lo, hi}, ...]
    }
    """
    # 1) 历史数据
    ts = load_and_clean_data(zone_filter)

    # 2) 没有数据则生成模拟数据（和你 notebook 一致）
    if ts is None or len(ts) == 0:
        hours_idx = pd.date_range(
            start=pd.Timestamp.now().floor('D') - pd.Timedelta(days=7),
            end=pd.Timestamp.now().floor('H'),
            freq='H'
        )
        base = 30
        daily_cycle = 15 * np.sin(2 * np.pi * np.arange(len(hours_idx)) / 24 - np.pi / 2)
        weekly_cycle = 5 * np.sin(2 * np.pi * np.arange(len(hours_idx)) / (24 * 7))
        noise = np.random.normal(0, 3, len(hours_idx))
        ts = pd.Series(np.maximum(5, base + daily_cycle + weekly_cycle + noise), index=hours_idx)

    # 3) 预测
    preds, lo, hi, model_name = forecast_with_ml(ts, predict_hours)
    # 如果模型失败，fallback 简单模式
    if preds is None:
        recent_mean = ts.tail(min(24, len(ts))).mean()
        recent_std = ts.tail(min(24, len(ts))).std() or 1.0
        preds = []
        for h in range(predict_hours):
            hour_factor = 0.9 + 0.2 * np.sin(2 * np.pi * h / 24)
            preds.append(max(0, recent_mean * hour_factor + np.random.normal(0, recent_std * 0.1)))
        preds = np.array(preds)
        lo = preds * 0.8
        hi = preds * 1.2
        model_name = "Simple-Pattern"

    last_dt = ts.index[-1]
    future_times = pd.date_range(start=last_dt + pd.Timedelta(hours=1), periods=predict_hours, freq="H")

    # 只给最近48小时历史（避免太大，前端也够画图）
    hist_ts = ts.tail(48)
    history_series = [
        {"time": pd.Timestamp(t).isoformat(), "y": float(v)}
        for t, v in zip(hist_ts.index, hist_ts.values)
    ]

    predictions = [
        {
            "time": pd.Timestamp(t).isoformat(),
            "y": float(y),
            "lo": float(l),
            "hi": float(h),
        }
        for t, y, l, h in zip(future_times, preds, lo, hi)
    ]

    return {
        "ok": True,
        "model": model_name,
        "zone": zone_filter or None,
        "history": {
            "points": len(hist_ts),
            "avg": float(ts.mean()),
            "min": float(ts.min()),
            "max": float(ts.max()),
            "series": history_series,
        },
        "predictions": predictions
    }

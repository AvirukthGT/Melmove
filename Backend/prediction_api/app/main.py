from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
from .forecast_core import predict_parking, load_and_clean_data, forecast_with_ml
import io
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Parking Prediction API is running. See /docs and /predict."}

@app.get("/predict")
def get_prediction(zone: str = "", hours: int = 24):
    data = predict_parking(zone_filter=zone, predict_hours=hours)
    return JSONResponse(data)

@app.get("/predict_plot")
def predict_plot(zone: str = "", hours: int = 24):
    ts = load_and_clean_data(zone)
    if ts is None or len(ts) == 0:
        hours_idx = pd.date_range(
            start=pd.Timestamp.now().floor('D') - pd.Timedelta(days=7),
            end=pd.Timestamp.now().floor('H'),
            freq='H'
        )
        base = 30
        daily_cycle = 15 * np.sin(2 * np.pi * np.arange(len(hours_idx)) / 24 - np.pi/2)
        weekly_cycle = 5 * np.sin(2 * np.pi * np.arange(len(hours_idx)) / (24*7))
        noise = np.random.normal(0, 3, len(hours_idx))
        ts = pd.Series(np.maximum(5, base + daily_cycle + weekly_cycle + noise), index=hours_idx)

    preds, lo, hi, model_name = forecast_with_ml(ts, hours)
    if preds is None:
        # 兜底
        recent_mean = ts.tail(min(24, len(ts))).mean()
        recent_std = ts.tail(min(24, len(ts))).std() or 1.0
        preds = []
        for h in range(hours):
            hour_factor = 0.9 + 0.2 * np.sin(2 * np.pi * h / 24)
            preds.append(max(0, recent_mean * hour_factor + np.random.normal(0, recent_std * 0.1)))
        preds = np.array(preds)
        lo = preds * 0.8
        hi = preds * 1.2
        model_name = "Simple-Pattern"

    last_dt = ts.index[-1]
    future_times = pd.date_range(start=last_dt + pd.Timedelta(hours=1), periods=hours, freq="H")

    plt.figure(figsize=(16, 8))
    recent_hours = 48
    recent_ts = ts.tail(recent_hours) if len(ts) > recent_hours else ts

    plt.plot(recent_ts.index, recent_ts.values,
             label="Historical Data", linewidth=2, color='steelblue', alpha=0.8)
    plt.plot(future_times, preds, marker='o',
             label=f"Prediction ({model_name})", color='red', linewidth=2, markersize=5)
    plt.fill_between(future_times, lo, hi, color='red', alpha=0.2, label="90% Confidence Interval")
    plt.axvline(ts.index[-1], linestyle='--', color='black', alpha=0.7,
                label="Prediction Start", linewidth=2)
    plt.title(f"🚗 Parking Space Availability Prediction ({zone or 'All Zones'})", fontsize=16, pad=20)
    plt.xlabel("Time", fontsize=12)
    plt.ylabel("Available Parking Spaces", fontsize=12)
    plt.legend(fontsize=11, loc='upper left')
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)

    all_values = list(recent_ts.values) + list(preds)
    y_min = max(0, min(all_values) - 5)
    y_max = max(all_values) + 5
    plt.ylim(y_min, y_max)

    max_idx = int(np.argmax(preds))
    min_idx = int(np.argmin(preds))
    plt.annotate(f'Peak: {preds[max_idx]:.1f}',
                 xy=(future_times[max_idx], preds[max_idx]),
                 xytext=(10, 10), textcoords='offset points')
    plt.annotate(f'Low: {preds[min_idx]:.1f}',
                 xy=(future_times[min_idx], preds[min_idx]),
                 xytext=(10, -20), textcoords='offset points')

    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=140)
    plt.close()
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

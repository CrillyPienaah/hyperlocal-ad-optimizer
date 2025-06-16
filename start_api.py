#!/usr/bin/env python3
import uvicorn
import sys
import os

if __name__ == "__main__":
    print("Starting FastAPI server for style recommendations...")
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
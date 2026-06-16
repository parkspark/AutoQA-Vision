import subprocess
import imageio_ffmpeg
import os
from pathlib import Path

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print("FFmpeg executable:", ffmpeg_exe)

outputs_dir = Path("outputs")

def convert_video(filename):
    input_path = outputs_dir / filename
    temp_path = outputs_dir / f"temp_{filename}"
    backup_path = outputs_dir / f"orig_{filename}"
    
    if not input_path.exists():
        print(f"File {input_path} does not exist. Skipping.")
        return
        
    print(f"Converting {input_path} to H.264...")
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", str(input_path),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        str(temp_path)
    ]
    
    try:
        subprocess.run(cmd, check=True)
        # Rename original to backup, and temp to original
        if backup_path.exists():
            backup_path.unlink()
        input_path.rename(backup_path)
        temp_path.rename(input_path)
        print(f"Successfully converted and updated {filename}!")
    except Exception as e:
        print(f"Error converting {filename}: {e}")
        if temp_path.exists():
            temp_path.unlink()

if __name__ == "__main__":
    convert_video("track_v3_hysteresis_0725.mp4")
    convert_video("track_baseline_v2_0725.mp4")

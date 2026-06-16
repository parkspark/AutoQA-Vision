# MINI_DATA_PROJECT — 던파 캐릭터 탐지 & 추적

던전앤파이터 화면에서 **character**(class 0, 모든 플레이어 캐릭터)와 **user_id**(class 1, 닉네임)를
탐지하고, 동영상에서 "내 캐릭터"를 실시간 추적하는 **YOLO11s** 프로젝트.

- **1단계**: 정적 스크린샷 탐지 (v1~v2)
- **2단계 (현재)**: 동영상에서 캐릭터 실시간 추적 (v3~)

> 모델 설계(A안), 학습 고정 파라미터, 하드웨어 제약, 버전 이력 등 **개발 의사결정**은 [`CLAUDE.md`](CLAUDE.md)에 정리되어 있다.
> 이 문서는 **폴더 구조와 사용법**을 설명한다.

---

## ⚡ 빠른 시작 (Quick Start)

클론 직후 바로 실행할 수 있다. 현역 추론 가중치(`runs/df_yolo11s_1280_v3/weights/best.pt`, 19MB)가
**저장소에 포함**되어 있어 별도 모델 다운로드가 필요 없다.

### 사전 요구

- **Python 3.12**
- **Node.js 20+** (풀스택 웹 UI를 쓸 때만 필요)
- (선택) NVIDIA GPU + CUDA — 없어도 **CPU로 추론 가능**(느릴 뿐)

### 1) 설치

```powershell
git clone https://github.com/parkspark/AutoQA-Vision.git
cd AutoQA-Vision

python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> **GPU 가속(선택)**: 기본 `pip install`은 CPU용 torch를 받는다. GPU를 쓰려면 본인 CUDA에 맞는 빌드로 교체한다.
> 예) RTX 20/30/40 계열: `pip install torch==2.12.0 torchvision==0.27.0 --index-url https://download.pytorch.org/whl/cu126`

### 2) 실행 (목적별 3가지)

| 목적 | 명령어 | 접속 | 비고 |
|---|---|---|---|
| **① 프로젝트 소개 페이지** | `.venv\Scripts\streamlit run portfolio_app.py` | http://localhost:8501 | 가장 빠름. Python만 |
| **② API 백엔드** (탐지·추적) | `web\backend\run-api.bat` | http://127.0.0.1:8000/docs | Python만. Swagger에서 바로 테스트 |
| **③ 풀스택 웹 UI** | `cd web\frontend && npm install` 후, 루트에서 `start_web.bat` | http://localhost:3000 | 백엔드:8000 + 프론트:3000 동시 실행 |

> ③ 풀스택은 최초 1회 `npm install`(프론트엔드 의존성 복원)이 필요하다. 이후에는 `start_web.bat`만 실행하면 된다.
> 웹 UI에서 본인 스크린샷/영상을 업로드해 탐지·추적을 확인할 수 있으며, 동봉된 샘플 이미지 8장으로도 즉시 시연된다.

### 포함되지 않은 것 (용량/재생성 가능)

대용량 자산은 `.gitignore`로 제외했다 — 클론 후 **앱 실행에는 영향 없다**.

- `datasets/`(5GB+), `labeled/` 원본 전체(608MB, 샘플 8장만 포함), `DF_character_dataset/`, `reviews/` → 파이프라인(`scripts/convert_labelme.py` 등)으로 재생성
- 사전학습 가중치 `models/`, v1·v2 학습 산출물, 대형 데모 영상 → 학습/추적 스크립트로 재생성
- 데모 갤러리의 일부 대형 추적 영상은 미포함(작은 데모 1개 `outputs/track_color_demo.mp4`는 포함)

---

## 📂 폴더 구조

```
MINI_DATA_PROJECT/
│
├── 🔧 코어 (위치 고정 — 코드/데이터, 경로가 강하게 결합되어 있음)
│   ├── scripts/                파이프라인 스크립트 (학습·검수·추적·보고)
│   ├── webapp/                 추론·추적 Flask 웹앱 (+ video_out/ 출력)
│   ├── labeled/                원본 스크린샷 907쌍 (jpg + labelme JSON)
│   ├── DF_character_dataset/   직업별 단독 스프라이트 7,070장 (합성 소스)
│   ├── datasets/               YOLO 데이터셋 (df/) + 영상 프레임 (df_video/)
│   ├── runs/                   학습 결과 (현역: df_yolo11s_1280_v3)
│   └── df_dataset.yaml         YOLO 데이터셋 설정
│
├── 📦 산출물 / 운영 (2026-06-14 그룹화)
│   ├── models/                 사전학습 가중치 (yolo11s.pt, yolo26n.pt)
│   ├── reports/                버전 비교 보고서 *.ipynb + *_assets/
│   ├── reviews/                라벨 검수 사이클 산출물 (review/ review_audit/ ...)
│   ├── outputs/                추적 영상·지표(track_*) + 감사 CSV(unlabeled_audit*)
│   ├── logs/                   학습/서버 로그 (train*, server_*, chunk_status)
│   ├── backups/                라벨 백업 아카이브 (*_backup_*.zip)
│   └── hardware/               전원 이슈 참고 자료
│
├── 🖥️ 루트 진입점 / 문서
│   ├── portfolio_app.py        프로젝트 소개(포트폴리오) Streamlit 페이지
│   ├── CLAUDE.md               개발 의사결정·이력 (단일 진실)
│   ├── README.md               이 문서 (구조·사용법)
│   ├── PROJECT_HISTORY.md      전체 진행 이력 (문제→해결, 에이전트용 자기완결 문서)
│   └── requirements.txt        Python 의존성 (torch는 GPU별 CUDA 빌드 별도 설치)
└── .venv/                      Python 3.12 가상환경 (torch는 GPU별 빌드: 5090=cu128 / 2070S=cu126)
```

### 폴더별 역할

| 폴더 | 목적 | 비고 |
|---|---|---|
| `scripts/` | 전체 파이프라인 코드 | 서로를 `import`하므로 **루트 한 단계 아래 위치 고정** |
| `webapp/` | `app.py`(:5000 스크린샷) · `video_app.py`(:5001 영상 추적) | `runs/`·`scripts/bytetrack_df.yaml` 참조 |
| `portfolio_app.py` | 프로젝트 소개 랜딩 페이지 (Streamlit) | 루트 파일. `outputs/`·`reports/*_assets/` 자산을 임베드 |
| `labeled/` | 사람이 라벨링한 원본 (단일 진실) | 수정 전 `backups/`에 백업 |
| `DF_character_dataset/` | 합성용 스프라이트 소스 | 직업별 하위 폴더 |
| `datasets/` | `df/`(학습 데이터셋, 재생성 대상) · `df_video/`(영상 pseudo-label) | `df/`는 직접 수정 금지 |
| `runs/` | YOLO 학습 산출물 | 현역 가중치: `runs/df_yolo11s_1280_v3/weights/best.pt` |
| `models/` | 학습 베이스가 되는 사전학습 가중치 | `train.py`가 `yolo11s.pt` 로드 |
| `reports/` | 분석 노트북 + 임베드 이미지 | `build_report*.py`가 생성 |
| `reviews/` | 라벨 검수 페이지·결과 | `make_*review.py` 생성 → `apply_*review.py` 반영 |
| `outputs/` | 추적 결과/지표, 감사 CSV | 스크립트가 자동 기록 |
| `logs/` | 셸 리다이렉트 로그 | 코드가 읽지 않음 (참고용) |
| `backups/` | 라벨 변경 전 zip 백업 | `apply_*review.py`가 자동 생성 |

---

## 🚀 사용법

모든 스크립트는 `.venv`의 Python으로 실행한다.

```powershell
# 학습 사이클 (라벨 반영 후)
.venv\Scripts\python.exe scripts\convert_labelme.py     # labelme → YOLO + train/val 분할
.venv\Scripts\python.exe scripts\synthesize.py          # 스프라이트 합성 2,000
.venv\Scripts\python.exe scripts\merge_video_frames.py  # 영상 프레임 train 병합
.venv\Scripts\python.exe scripts\train.py               # 학습 (run name은 train.py에서 변경)
# 중단 복구: scripts\resume_train.py

# 정적 라벨 검수 사이클
.venv\Scripts\python.exe scripts\audit_unlabeled.py     # → outputs/unlabeled_audit.csv
.venv\Scripts\python.exe scripts\make_review.py         # → reviews/review/review.html (브라우저로 O/X/? 판정)
.venv\Scripts\python.exe scripts\apply_review.py        # O 판정을 원본 JSON 반영 (backups/ 백업 먼저)

# 영상 추적 / 평가
.venv\Scripts\python.exe scripts\track_video.py --video "<경로>" --out outputs\out.mp4

# 보고서 생성
.venv\Scripts\python.exe scripts\build_report_v2_v3.py  # → reports/report_v2_v3.ipynb

# 웹앱
webapp\start_webapp.bat           # :5000  스크린샷 추론
webapp\start_video_webapp.bat     # :5001  영상 추적

# 포트폴리오 소개 페이지 (Streamlit)
.venv\Scripts\streamlit.exe run portfolio_app.py   # 브라우저로 프로젝트 개요·추적 데모·버전 이력 열람
```

> `portfolio_app.py`는 학습/추론과 무관한 **소개용 정적 페이지**다. `outputs/`의 추적 영상과
> `reports/*_assets/`의 비교 이미지를 임베드하며, 자산이 없으면 안내 문구로 자동 대체한다.

> 검수 폴더·산출물 경로는 각 스크립트의 `--outdir` / `--out` 기본값으로 지정되어 있어,
> 위 그룹화 폴더(`reviews/`, `outputs/`, `reports/`)를 자동으로 가리킨다.

---

## 🗂️ 구조 정리 메모 (2026-06-14)

루트에 28개 항목이 흩어져 있던 것을 **관심사 분리** 기준으로 그룹화했다.

- **그룹화 대상**: 산출물(보고서·추적결과·감사), 검수 폴더 5종, 로그, 백업, 사전학습 가중치
  → `reports/`, `outputs/`, `reviews/`, `logs/`, `backups/`, `models/`
- **무변경**: `scripts/`·`datasets/`·`runs/`·`labeled/`·`DF_character_dataset/`·`df_dataset.yaml`
  - 스크립트가 `ROOT = __file__.parent.parent` 기준으로 데이터 폴더를 참조하고, 학습 코드에
    절대경로가 박혀 있어 **이동 시 회귀 위험이 큼**. 전원 불안정한 학습 환경을 고려해 코어는 그대로 둠.
- 이동에 따라 깨지는 **경로 참조 13개 파일을 함께 수정**했다 (검수/산출물 기본 경로, 보고서 출력 경로 등).
  학습 진입점(`train.py`·`resume_train.py`)의 학습 인자와 `df_dataset.yaml`은 무수정.

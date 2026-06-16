# MINI_DATA_PROJECT — 던파 캐릭터 탐지 & 추적

던전앤파이터 화면에서 **character**(0, 모든 플레이어 캐릭터)와 **user_id**(1, 닉네임)를 탐지하는 YOLO11s 프로젝트.
**목표 2단계**: ① 정적 스크린샷 탐지(v1~v2) → ② **동영상에서 캐릭터 실시간 추적**(v3~, 현재 단계).

**구조 (A안)**: 내 캐릭터와 파티원은 시각적으로 구분 불가하므로 모델은 모든 캐릭터를 탐지하고,
"내 캐릭터" 선정은 후처리(가장 신뢰도 높은 user_id 박스 바로 아래의 character 선택)가 담당한다.

## 고정 결정 사항 (변경 전 반드시 근거 확인)

- `imgsz=1280` — user_id(원본 ~70×24px)가 640에서는 탐지 한계선에 걸림. **640으로 낮추지 말 것**
- `batch=8` — RTX 5090(32GB VRAM)에서 AutoBatch 실측값. RAM 증설(64GB)과 무관(VRAM 제약). AutoBatch OOM 로그는 정상
- `cache="disk"` — **Windows에서 `cache="ram"`은 워커 spawn 시 캐시 직렬화로 크래시(pickle truncated)**. disk 캐시(.npy)는 64GB RAM이 OS 페이지캐시로 흡수 → RAM 속도. `workers=12`(i7-12700K)
- train/val 분할 seed 42 고정 — 버전 간 공정 비교를 위해 유지
- 합성·영상 프레임은 **train에만** 넣는다 (val 오염 금지). val은 사람 라벨 stills 90장 고정
- 라벨 원본: `labeled/`의 labelme JSON이 단일 진실(수정 전 `labeled_json_backup_YYYYMMDD.zip` 백업). 영상 프레임 라벨은 `datasets/df_video/`의 pseudo-label(재생성 가능, 검수로 정제)
- 환경: `.venv` (Python 3.12, torch 2.11+cu128 — **5090은 cu128 빌드 필수**, ultralytics 8.4.66)

## ⚠️ 하드웨어 전원 불안정 (학습 전 필독)

이 PC는 **GPU 풀로드(학습) 시 전원이 순간 차단되어 강제 재부팅**된다(2026-06 기준 다수 발생, Kernel-Power 41·덤프 없음 = 정전형). 전력제한(`-pl 400`)·클럭고정(`-lgc 210,2100`, 부하 350→236W)으로도 **못 막음**. **신규 PSU가 2026-06-16경 도착 예정 → 그 후 연속 학습이 정답.**

**PSU 도착 전 학습이 꼭 필요하면 "청크 그라인딩"으로 우회** (실측으로 80 epoch 완주 성공):
- 2~8 epoch씩 `resume_train.py` 실행 → epoch 경계(results.csv 증가)에서 정지 → 다시 resume 반복.
- **반드시 `taskkill /F /IM python.exe /T`(트리킬)로 정리** — `Stop-Process`는 워커 좀비가 남아 다음 청크가 행 걸림.
- 청크 사이 GPU 메모리가 idle(<1.5GB)로 떨어진 뒤 재실행.
- 청크 학습은 **모델 품질에 영향 없음**(resume가 가중치·옵티마이저·EMA·epoch·LR스케줄 복원, epoch 경계 정지라 손상 없음). 비용은 재시작 오버헤드·재현성뿐.
- 추론(추적·평가·웹앱)은 부하가 가벼워 크래시 위험 낮음.

## 폴더 구조

> 2026-06-14 루트 정리: 흩어진 산출물·검수·로그·백업·모델을 의미 단위 폴더로 그룹화했다.
> 경로 결합이 강한 코어(scripts/datasets/runs/labeled/DF_character_dataset/df_dataset.yaml)는 위치 무변경.
> 전체 구조·이유는 `README.md` 참조.

```
# 코어 (위치 고정 — 경로 결합·학습 파이프라인)
labeled/                  원본 스크린샷 907쌍 (jpg + labelme JSON, 라벨명: user_character/user_id)
DF_character_dataset/     직업별 단독 스프라이트 7,070장 (알파 PNG, 전부 character) — 합성 소스
datasets/df/              YOLO 데이터셋 (convert+synthesize+merge 재생성, 직접 수정 금지)
datasets/df/videos/       원본 동영상 5개 (학습용 4개 + 평가 holdout 1개: 2025-07-25)
datasets/df_video/        영상 프레임 pseudo-label (extract_frames 산출, train에 merge되는 영속 소스)
runs/                     학습 결과. 현역: df_yolo11s_1280_v3 / 직전: _v2 / v1: _e80
scripts/                  파이프라인 스크립트 (아래 참조)
webapp/                   start_webapp.bat(:5000, 스크린샷 추론) / start_video_webapp.bat(:5001, 영상 추적)
df_dataset.yaml           YOLO 데이터셋 설정

# 루트 진입점 / 문서
portfolio_app.py          프로젝트 소개(포트폴리오) Streamlit 페이지 — outputs/·reports/*_assets/ 자산 임베드. 실행: `.venv\Scripts\streamlit run portfolio_app.py`
PROJECT_HISTORY.md        전체 진행 이력(문제→해결). 타 서비스 에이전트도 읽을 수 있는 자기완결 문서
README.md                 폴더 구조·사용법
requirements.txt          의존성 (torch는 GPU별 CUDA 빌드 별도 설치, streamlit 포함)

# 그룹화 폴더 (산출물·운영)
models/                   사전학습 가중치 (yolo11s.pt = train.py 베이스, yolo26n.pt)
reports/                  버전 비교 보고서 노트북 report_*.ipynb + report_*_assets/
reviews/                  라벨 검수 사이클 산출물 (review/ review_audit/ review_v2/ review_v2_audit/ review_video/)
outputs/                  추적 결과 (track_*.mp4 · track_metrics_*.json) · 감사 CSV (unlabeled_audit*.csv)
logs/                     학습/서버 로그 (train*_log/err.txt · server_*.txt · chunk_status.txt)
backups/                  라벨 백업 아카이브 (*_backup_*.zip, apply_*review.py가 자동 생성)
hardware/                 전원 이슈 참고 자료 (5090cable.jpg, power_manual.jpg)
```

## 파이프라인 (scripts/, 모두 .venv의 python으로 실행)

**학습 사이클**: `convert_labelme.py`(labelme→YOLO+분할) → `synthesize.py`(스프라이트 합성 2,000) →
`merge_video_frames.py`(영상 프레임 train 병합) → `train.py`(run name 버전별 변경). 중단 복구: `resume_train.py`.
> 라벨 반영 후 datasets/df의 images/labels를 지우고 **convert+synthesize+merge 셋 다 재실행**해야 정합 유지.

**정적 라벨 검수 사이클** (labeled/ stills): `audit_unlabeled.py` → `make_review.py`(클릭 검수 페이지) →
사용자 O/X/? 판정 → `render_ambiguous.py`(? 광역 렌더) → `apply_review.py`(O를 원본 JSON 반영, 백업 먼저).

**영상 프레임 파이프라인**:
- `extract_frames.py` — 학습용 4개 동영상에서 0.5fps 추출 + v2/v3 pseudo-label 생성(conf 0.5 게이팅), 메뉴 화면 제외. 닉네임만 있고 캐릭터 미탐지 프레임은 `review_pool.csv`로 분리. 07-25는 holdout이라 제외
- `make_video_review.py` — 영상 프레임의 character 박스를 크롭해 O/X/? 검수 페이지(review_video/) 생성
- `recover_review_csv.py` — CSV 내보내기 없이 페이지만 저장(HTML)한 경우, DOM 클래스에서 판정 복구
- `apply_video_review.py` — X(NPC·소환수) 박스를 datasets/df_video 라벨에서 제거(백업 먼저, --dry-run 지원)

**추적/평가/보고**:
- `track_video.py` — v3 + ByteTrack + **hysteresis 락**으로 영상 추적. 라벨 없이 추적지표(추적률·ID스위치) 산출. `--out`으로 주석 영상. 락 파라미터: `--coast-grace`(기본10)·`--challenge-frames`(기본6)
- `bytetrack_df.yaml` — track_buffer 90으로 튜닝한 트래커 설정
- `gen_report_assets.py` / `build_report_v2_v3.py` — 보고서용 예시 이미지·노트북 생성

## 진행 이력 / 현황 (2026-06-14 기준)

| 버전 | 내용 | 결과 (val mAP50) |
|---|---|---|
| v1 | 실사 817 + 합성 2,000 | 0.856 |
| v2 | 1·2차 검수 반영 재학습. character P 0.923 | 0.923 |
| **v3 (현역)** | **영상 프레임 721장(pseudo-label) 추가, 80 epoch 완주.** 영상 도메인 적응 | **0.931** (ep50) |
| v4 (데이터 준비됨) | 영상 프레임 검수(NPC 오탐 107 제거) 반영. **아직 미학습** | — |

- **현역 모델: `runs/df_yolo11s_1280_v3/weights/best.pt`** (mAP50 0.931). webapp/app.py·video_app.py 모두 v3 사용
- **v2→v3 트레이드오프**: 동영상 추적률 0.840→**0.858**·캐릭터 탐지율 0.885→0.888(↑) ↔ 정적 mAP50-95 0.591→0.573·Recall 0.858→0.834(↓). 원인=pseudo-label의 가려진 파티원 미탐지(FN)·모션블러. 상세는 report_v2_v3.ipynb
- **영상 추적**: 진짜 병목은 탐지가 아니라 "내 캐릭터 선정 정책" 진동. hysteresis 락으로 ID스위치 276→88(추적률 0.72) 개선 완료. 07-25 평가에서 탐지율(~88%)이 추적률 천장
- **v4 데이터셋 준비 완료**: review_video 검수(O1484/X107/?2) 반영 → datasets/df 재생성 끝(train 3,538). `train.py` name=`df_yolo11s_1280_v4`. **학습은 신규 PSU 후 또는 청크로** (라벨 변화 작아 ROI 낮음 — 데이터 더 쌓고 진행 권장)
- 남은 과제: ① v4 학습(PSU 후) ② pseudo-label 검수 추가(가려진 파티원 recall 보강) ③ 모션블러 프레임 정제 ④ 실시간 캡처(dxcam) 연동

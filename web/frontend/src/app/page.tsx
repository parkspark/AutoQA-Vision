"use client";

import Link from "next/link";
import { Section } from "@/components/ui";
import { VersionChart } from "@/components/version-chart";

const TECH = ["YOLO11s", "ByteTrack", "Hysteresis Lock"];

const PIPELINE = [
  { t: "라벨 변환", d: "labelme JSON → YOLO 포맷 + train/val 분할 (seed 42)" },
  { t: "스프라이트 합성", d: "직업별 단독 스프라이트 7,070장으로 합성 2,000장 생성" },
  { t: "영상 프레임 병합", d: "동영상 0.5fps 추출 + pseudo-label을 train에 병합" },
  { t: "학습", d: "YOLO11s · imgsz 1280 · 80 epoch (전원 이슈로 청크 그라인딩)" },
  { t: "추적", d: "ByteTrack + hysteresis 락으로 '내 캐릭터' 락온" },
];

export default function Home() {
  return (
    <>
      {/* ----------------------------------------------------------- HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-12">
        <div className="animate-fade-up">
          <div className="flex flex-wrap gap-2 mb-6">
            {TECH.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.1] max-w-3xl">
            게임 화면 속에서
            <br />
            <span className="text-gradient">내 캐릭터</span>를
            <br />
            찾고 추적합니다
          </h1>
          <p className="mt-6 text-lg text-muted max-w-2xl">
            정적 스크린샷 탐지부터 동영상 실시간 추적까지. YOLO11s로 캐릭터와 닉네임을 탐지하고,
            후처리·hysteresis 락으로 파티 난전 속에서도 내 캐릭터를 안정적으로 따라갑니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/detect" className="btn-brand px-5 py-3 text-sm">라이브 탐지 →</Link>
            <Link href="/track" className="btn-ghost px-5 py-3 text-sm">영상 추적 →</Link>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- PREVIEW IMAGE/GIF */}
      <Section className="!py-8">
        <div className="card overflow-hidden max-w-4xl mx-auto">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>🔍</span> 실시간 게임 QA 탐지 예시
            </h3>
            <span className="text-xs text-muted hidden sm:inline">
              YOLO11s 모델 탐지 결과 시각화 (캐릭터 & 닉네임 박스 바인딩)
            </span>
          </div>
          <div className="relative aspect-video w-full bg-black/40 overflow-hidden flex items-center justify-center">
            {/* 
              [TIP] 아래 src 경로를 원하는 이미지 또는 GIF 파일 경로로 변경해 주세요.
              - public 폴더 아래에 이미지(예: public/my-demo.gif)를 넣은 후 "/my-demo.gif" 형태로 경로를 지정할 수 있습니다.
              - 백엔드가 실행 중일 때는 '/static/labeled/ScreenShot2024_0304_084801113.jpg' 경로로 실제 스크린샷이 보입니다.
            */}
            <img
              src="/image/track_v3_hysteresis_0725 - 1080p.gif"
              alt="게임 QA 자동화 탐지 예시"
              className="w-full h-full object-contain"
              onError={(e) => {
                // 백엔드가 꺼져있어 로드 실패 시, 데모용 고화질 플레이 게임 컨셉 이미지로 대체
                e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80";
              }}
            />
          </div>
          <div className="px-6 py-3 bg-muted/20 text-xs text-muted text-center border-t border-border">
            파티플레이 데모 - 마을과 던전에서 <code className="text-brand"> 캐릭터 탐지 및 추적</code> <code className="text-foreground"></code>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- 소개 */}
      <Section eyebrow="소개" title="비전 기반 블랙박스 테스팅 자동화">
        <div className="space-y-12">
          {/* 1. 메인 소개 */}
          <div className="max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <span>🎯</span> 완벽한 코드가 완벽한 사용자 경험을 보장할까요?
            </h3>
            <p className="text-muted leading-relaxed text-lg">
              소프트웨어 개발 과정에서 내부 로직을 검증하는 화이트박스 테스트(White-box Testing)는 매우 중요합니다. 하지만 코드가 정상적으로 작동한다고 해서, 화면에 렌더링된 결과물이나 실제 사용자의 플레이 경험까지 완벽하다고 단언할 수는 없습니다.<br className="hidden sm:block" /><br />
              우리는 기존 화이트박스 중심 테스트가 가진 명확한 한계를 극복하고, 실제 사용자 관점에서의 품질을 보장하기 위해 <strong className="text-foreground font-semibold">블랙박스 자동화 QA(Black-box Automated QA)</strong> 솔루션을 제안합니다.
            </p>
          </div>

          {/* 2. 딜레마 (문제점) */}
          <div>
            <h4 className="text-xl font-bold mb-5 flex items-center gap-2 text-char">
              <span>⚠️</span> 기존 화이트박스 테스트의 3가지 딜레마
            </h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="card p-6">
                <div className="font-semibold mb-2 text-foreground">1. 사용자 관점의 부재</div>
                <p className="text-sm text-muted leading-relaxed">
                  변수와 함수가 올바르게 연산되더라도, 실제 화면(UI)에서 캐릭터가 깨지거나 버튼이 클릭되지 않는 &apos;시각적 오류&apos;는 잡아내기 어렵습니다.
                </p>
              </div>
              <div className="card p-6">
                <div className="font-semibold mb-2 text-foreground">2. 높은 유지보수 비용 (코드 종속성)</div>
                <p className="text-sm text-muted leading-relaxed">
                  내부 코드가 리팩토링되거나 구조가 조금만 변경되어도 테스트 코드 전체를 다시 수정해야 하는 번거로움이 발생합니다.
                </p>
              </div>
              <div className="card p-6">
                <div className="font-semibold mb-2 text-foreground">3. 테스트 인력의 기술 장벽</div>
                <p className="text-sm text-muted leading-relaxed">
                  QA 담당자가 프로그래밍 언어와 내부 아키텍처를 깊이 이해해야 하므로, 전문 인력 확보와 테스트 진행에 막대한 시간과 비용이 소모됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 3. 해결책 */}
          <div>
            <h4 className="text-xl font-bold mb-5 flex items-center gap-2 text-brand">
              <span>💡</span> 해결책: 사용자 경험을 그대로 모사하는 &apos;블랙박스 자동화 QA&apos;
            </h4>
            <p className="text-muted leading-relaxed mb-5">
              블랙박스 자동화 테스트는 내부 코드를 전혀 몰라도, 실제 유저가 소프트웨어(게임)를 조작하고 화면을 보는 방식 그대로를 테스트합니다.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="card p-6 border-brand/20 bg-brand/5">
                <div className="font-semibold mb-2 text-foreground">100% 사용자 중심 검증</div>
                <p className="text-sm text-muted leading-relaxed">
                  AI 비전 기술을 통해 화면에 출력되는 픽셀 단위의 결과물을 분석하여 렌더링 오류, UI 겹침, 캐릭터의 비정상 동작을 즉각적으로 탐지합니다.
                </p>
              </div>
              <div className="card p-6 border-brand/20 bg-brand/5">
                <div className="font-semibold mb-2 text-foreground">코드 독립성 확보</div>
                <p className="text-sm text-muted leading-relaxed">
                  내부 서버나 코드가 어떻게 변경되든, 최종적으로 화면에 출력되는 결과물만 정상이라면 테스트는 성공합니다. 잦은 업데이트에도 테스트 시나리오가 깨지지 않습니다.
                </p>
              </div>
              <div className="card p-6 border-brand/20 bg-brand/5">
                <div className="font-semibold mb-2 text-foreground">무한한 확장성과 24시간 자동화</div>
                <p className="text-sm text-muted leading-relaxed">
                  사람의 눈과 손을 대신하는 자동화 파이프라인을 구축하여, 피로도 없이 수만 번의 반복 테스트와 다양한 엣지 케이스(Edge Case)를 24시간 내내 검증할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 4. 비교 표 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">화이트박스 vs 블랙박스</h4>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    <th className="p-4 font-semibold text-muted w-1/4">구분</th>
                    <th className="p-4 font-semibold text-muted w-3/8">화이트박스 테스트 (기존)</th>
                    <th className="p-4 font-semibold text-brand w-3/8">블랙박스 자동화 QA (본 프로젝트)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-foreground">검증 대상</td>
                    <td className="p-4 text-muted">내부 소스 코드, 알고리즘, 데이터 구조</td>
                    <td className="p-4 text-foreground">최종 출력 화면 (UI/UX), 사용자 상호작용</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-foreground">테스트 관점</td>
                    <td className="p-4 text-muted">개발자 관점 (로직이 맞는가?)</td>
                    <td className="p-4 text-foreground">사용자 관점 (화면이 정상적으로 보이는가?)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-foreground">유지보수 난이도</td>
                    <td className="p-4 text-muted">높음 (코드 변경 시 테스트도 수정 필요)</td>
                    <td className="p-4 text-foreground">낮음 (코드 구조에 의존하지 않음)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-foreground">요구 지식</td>
                    <td className="p-4 text-muted">높은 프로그래밍 및 내부 아키텍처 이해도</td>
                    <td className="p-4 text-foreground">실제 사용 시나리오 및 기획 의도 이해도</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-foreground">핵심 가치</td>
                    <td className="p-4 text-muted">시스템 안정성 및 논리적 결함 방지</td>
                    <td className="p-4 font-semibold text-brand">실제 서비스 품질(QoE) 보장 및 QA 비용 절감</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- 설계 */}
      <Section eyebrow="설계" title="왜 '모두 탐지 후 후처리'인가">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-6">
            <h3 className="font-semibold mb-2 text-char">문제</h3>
            <p className="text-sm text-muted leading-relaxed">
              내 캐릭터와 파티원은 시각적으로 구분이 불가능합니다. 모델이 &quot;내 캐릭터만&quot; 직접
              학습하도록 만들 수 없습니다.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-2 text-mine">해결</h3>
            <p className="text-sm text-muted leading-relaxed">
              모델은 <span className="text-foreground">모든 캐릭터</span>를 탐지하고, &quot;내 캐릭터&quot;
              선정은 후처리가 담당합니다 — 가장 신뢰도 높은 닉네임(user_id) 바로 아래의 character를 선택.
            </p>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- PIPELINE */}
      <Section eyebrow="파이프라인" title="라벨에서 추적까지">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PIPELINE.map((s, i) => (
            <div key={s.t} className="card p-5 relative">
              <div className="text-brand font-mono text-sm mb-2">0{i + 1}</div>
              <h3 className="font-semibold mb-1">{s.t}</h3>
              <p className="text-xs text-muted leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- RESULTS */}
      <Section eyebrow="결과" title="버전별 성능 추이">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div className="card p-6">
            <VersionChart />
          </div>
          <div className="space-y-4">
            <p className="text-muted leading-relaxed">
              실사 데이터와 검수 반영, 영상 도메인 적응을 거치며 정적 정확도(mAP50)가 꾸준히 올랐습니다.
              v3은 영상 프레임 721장을 추가해 동영상 도메인에 적응한 현역 모델입니다.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-brand">▹</span> v1 → v2: 라벨 검수 2사이클 반영, character 정밀도 0.923</li>
              <li className="flex gap-2"><span className="text-brand">▹</span> v2 → v3: 영상 프레임 추가로 추적률 0.840 → 0.858</li>
              <li className="flex gap-2"><span className="text-brand">▹</span> 진짜 병목은 탐지가 아니라 &quot;내 캐릭터 선정 정책&quot;의 진동이었음</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- HARDWARE */}
      <Section eyebrow="엔지니어링 노트" title="전원 불안정을 청크 학습으로 우회">
        <div className="card p-6 md:p-8">
          <p className="text-muted leading-relaxed max-w-3xl">
            학습 PC가 GPU 풀로드 시 전원이 순간 차단되어 강제 재부팅되는 문제(Kernel-Power 41)가 있었습니다.
            전력제한·클럭고정으로도 막지 못해, <span className="text-foreground">2~8 epoch 단위로 학습 →
              epoch 경계에서 정지 → resume 반복</span>하는 &quot;청크 그라인딩&quot;으로 80 epoch을 완주했습니다.
            resume가 가중치·옵티마이저·EMA·LR 스케줄을 복원하므로 모델 품질에는 영향이 없고, 비용은 재시작
            오버헤드뿐입니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip">Kernel-Power 41</span>
            <span className="chip">resume_train.py</span>
            <span className="chip">epoch 경계 정지</span>
            <span className="chip">80 epoch 완주</span>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- CTA */}
      <Section className="!pb-24">
        <div className="card p-8 md:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">직접 돌려보세요</h2>
          <p className="text-muted mb-6">스크린샷을 올려 탐지하거나, 짧은 영상으로 추적을 확인할 수 있습니다.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/detect" className="btn-brand px-5 py-3 text-sm">라이브 탐지 →</Link>
            <Link href="/track" className="btn-ghost px-5 py-3 text-sm">영상 추적 →</Link>
          </div>
        </div>
      </Section>
    </>
  );
}

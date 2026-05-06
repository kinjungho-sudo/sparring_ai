import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
        개인정보처리방침
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>최종 업데이트: 2026년 5월</p>

      <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>1. 수집하는 개인정보</h2>
          <p>스파링 AI(코마인드웍스)는 서비스 제공을 위해 다음의 정보를 수집합니다.</p>
          <ul className="mt-2 ml-4 space-y-1 list-disc">
            <li>이메일 주소 (회원가입 및 로그인 시)</li>
            <li>토론 기록 및 설정 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>2. 개인정보의 이용 목적</h2>
          <p>수집된 정보는 서비스 제공, 이용 제한 관리, 서비스 개선 목적으로만 사용됩니다.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>3. 개인정보 보유 기간</h2>
          <p>회원 탈퇴 시 또는 수집 목적 달성 후 즉시 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>4. 제3자 제공</h2>
          <p>스파링 AI는 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외입니다.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>5. 문의</h2>
          <p>개인정보 관련 문의는 아래로 연락 주세요.</p>
          <p className="mt-1">이메일: kinjungho@gmail.com</p>
        </section>
      </div>
    </div>
  )
}

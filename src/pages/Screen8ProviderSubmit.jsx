import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { Lock, Package } from '../components/Icons';
import { getPublicPassportApi } from '../api';
import { useIsMobile } from '../hooks/useIsMobile';

const Screen8ProviderSubmit = () => {
    const navigate = useNavigate();
    const { currentUser, submitService } = useDPPStore();
    const isMobile = useIsMobile();

    const [qrInput, setQrInput] = useState('QR8F2K');
    const [kind, setKind] = useState('REPAIR');
    const [detail, setDetail] = useState('');
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [checkedInAsset, setCheckedInAsset] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setAuthError("이 페이지는 공식 파트너사 전용 접근 구역입니다.");
            setTimeout(() => navigate('/login?return=/provider/service/submit'), 4000);
        } else if (currentUser.role !== 'PROVIDER') {
            setAuthError("수선/기타 서비스(PROVIDER) 인가 계정만 접근 가능합니다.");
            setTimeout(() => navigate('/'), 4000);
        }
    }, [currentUser, navigate]);

    if (authError) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '50px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
                    <div style={{ marginBottom: '20px' }}><Lock width={36} height={36} stroke="#1A4D3B" /></div>
                    <h2 style={{ fontSize: '1.5rem', color: '#102A20', marginBottom: '16px' }}>파트너스 접근 제한</h2>
                    <p style={{ color: '#718096' }}>{authError}</p>
                </div>
            </div>
        );
    }

    const handleCheckin = async () => {
        if (!currentUser || currentUser.role !== 'PROVIDER') return;

        setLoading(true);
        try {
            const res = await getPublicPassportApi(qrInput);
            setCheckedInAsset(res.data);
            alert("제품 입고 확인. 수선 내역을 입력해 주세요.");
        } catch (e) {
            alert("입고 스캔 실패: " + (e.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComplete = async () => {
        setLoading(true);
        try {
            await submitService(checkedInAsset.assetId || qrInput, kind);
            setSuccessMessage({
                title: "작업 기록 제출 완료",
                message: "정비 및 수선 내역 제출이 완료되었습니다.\n고객 승인 대기 상태로 전환됩니다."
            });
        } catch (e) {
            alert("기록 제출 실패: " + (e.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: isMobile ? '20px 12px' : '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: isMobile ? '28px 20px' : '40px', width: '100%', maxWidth: '600px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🛠️</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>파트너스 서비스 등재 (A/S)</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: 0 }}>
                        공식 인증 파트너 포털입니다.<br />입고된 제품을 식별하고 수리/정비 이력을 블록체인에 등재 요청합니다.
                    </p>
                </div>

                {!checkedInAsset ? (
                    <div style={{ background: '#FAFCFB', padding: '30px', borderRadius: '16px', border: '1px solid #E2E8F0', animation: 'fadeIn 0.3s' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#4A5568', marginBottom: '16px' }}>
                            1. 고객 위탁 품목 입고 스캔 (QR 문자열)
                        </label>
                        <input
                            value={qrInput}
                            onChange={e => setQrInput(e.target.value)}
                            placeholder="제품 QR 코드 스캔..."
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.1rem', letterSpacing: '2px', fontWeight: '600',
                                borderRadius: '12px', border: '2px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s',
                                marginBottom: '20px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                        <button
                            onClick={handleCheckin}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '12px',
                                background: loading ? '#CBD5E0' : '#2B6CB0', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 8px 15px rgba(43, 108, 176, 0.2)'
                            }}
                        >
                            {loading ? '검증 통신 중...' : '매장 입고 전산 처리 (Check-In)'}
                        </button>
                    </div>
                ) : (
                    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                        <div style={{
                            background: '#F0F9F4', border: '1px solid #C6F6D5', borderRadius: '16px', padding: '24px',
                            display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px'
                        }}>
                            <div style={{ marginTop: '4px' }}><Package width={28} height={28} stroke="#1A4D3B" /></div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#38A169', fontWeight: '700', marginBottom: '4px' }}>입고 대상 확인 완료</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#102A20' }}>{checkedInAsset.modelName}</div>
                                <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '4px' }}>Serial: {checkedInAsset.serialNumber || 'N/A'}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#4A5568', marginBottom: '12px' }}>
                                2. 서비스 분류
                            </label>
                            <select
                                value={kind}
                                onChange={e => setKind(e.target.value)}
                                style={{
                                    width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '12px',
                                    border: '1px solid #E2E8F0', background: '#FFFFFF', outline: 'none', color: '#102A20', cursor: 'pointer'
                                }}
                            >
                                <option value="REPAIR">🛠️ 수선 및 수리 공정 (Repair)</option>
                                <option value="CLEAN">✨ 프리미엄 세탁/클리닝 (Clean)</option>
                                <option value="UPCYCLE">♻️ 디자인 업사이클링 (Upcycle)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#4A5568', marginBottom: '12px' }}>
                                3. 상세 작업 내역 기입 (소유자 전달용)
                            </label>
                            <textarea
                                value={detail}
                                onChange={e => setDetail(e.target.value)}
                                placeholder="예: 지퍼 슬라이더 정품 교체 및 외부 스크래치 정밀 복원 작업 완료."
                                style={{
                                    width: '100%', minHeight: '120px', padding: '16px', fontSize: '0.95rem', borderRadius: '12px',
                                    border: '1px solid #E2E8F0', outline: 'none', resize: 'vertical', lineHeight: '1.5',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: '#4A5568', marginBottom: '12px' }}>
                                4. 증빙 데이터
                            </label>
                            <div style={{ background: '#F7FAFC', border: '1px dashed #A0AEC0', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#718096' }}>
                                📷 After 작업 사진 및 영수증 자동 연동됨<br />(시스템 테스트 모드)
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleSubmitComplete}
                                disabled={loading}
                                style={{
                                    flex: 2, padding: '16px', fontSize: '1.05rem', fontWeight: '700', borderRadius: '12px',
                                    background: loading ? '#CBD5E0' : 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                                    color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 15px rgba(26, 77, 59, 0.2)'
                                }}
                            >
                                {loading ? '암호화 전송 중...' : '서비스 기록 최종 전송 ➔'}
                            </button>
                            <button
                                onClick={() => setCheckedInAsset(null)}
                                style={{
                                    flex: 1, padding: '16px', fontSize: '1.05rem', fontWeight: '700', borderRadius: '12px',
                                    background: '#FFFFFF', color: '#718096', border: '1px solid #E2E8F0', cursor: 'pointer'
                                }}
                            >
                                뒤로/취소
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Success Modal */}
            {successMessage && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
                    backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s'
                }}>
                    <div style={{
                        background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center',
                        maxWidth: '400px', width: '90%', animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', background: '#F0FFF4', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem'
                        }}>
                            🛠️
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>{successMessage.title}</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.6', marginBottom: '32px', whiteSpace: 'pre-wrap' }}>{successMessage.message}</p>
                        <button
                            onClick={() => {
                                setSuccessMessage(null);
                                navigate('/me/provider'); // Typically navigates home or to provider dashboard
                            }}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#2B6CB0', // Provider Blue
                                color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#2C5282'}
                            onMouseOut={(e) => e.target.style.background = '#2B6CB0'}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Screen8ProviderSubmit;

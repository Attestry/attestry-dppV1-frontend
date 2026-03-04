import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { ShieldCheck, ArrowsExchange, ScanLine, Send } from '../components/Icons';
import { QRCodeSVG } from 'qrcode.react';
import { buildTransferAcceptUrl } from '../utils/qrPayload';
import { useIsMobile } from '../hooks/useIsMobile';

const Screen6TransferStart = () => {
    const { passportId } = useParams();
    const navigate = useNavigate();
    const { currentUser, initiateTransfer, getMyPassports, getActiveTransfer } = useDPPStore();
    const isMobile = useIsMobile();

    const [method, setMethod] = useState(null); // 'IN_PERSON_QR' or 'ONE_TIME_CODE'
    const [transferInfo, setTransferInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [transferCompleted, setTransferCompleted] = useState(false);

    // Fetch active transfer on mount
    useEffect(() => {
        const fetchActive = async () => {
            try {
                setLoading(true);
                const active = await getActiveTransfer(passportId);
                if (active && active.transferToken) {
                    const activeMethod = active.code ? 'ONE_TIME_CODE' : 'IN_PERSON_QR';
                    setMethod(activeMethod);
                    setTransferInfo(active);
                }
            } catch (err) {
                console.error("No active transfer or load failed", err);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) fetchActive();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [passportId, currentUser]);

    // Robust countdown timer based on true expiresAt
    useEffect(() => {
        if (!transferInfo || !transferInfo.expiresAt) return;

        const updateTimer = () => {
            let expiryTime;
            // Handle Spring Boot LocalDateTime serialization which occasionally comes as an array [y, M, d, h, m, s, ms]
            if (Array.isArray(transferInfo.expiresAt)) {
                const [y, M, d, h, m, s] = transferInfo.expiresAt;
                expiryTime = Date.UTC(y, M - 1, d, h || 0, m || 0, s || 0);
            } else {
                const utcStr = transferInfo.expiresAt.includes('Z') ? transferInfo.expiresAt : transferInfo.expiresAt + 'Z';
                expiryTime = new Date(utcStr).getTime();
            }

            const now = Date.now();
            const diffSec = Math.max(0, Math.floor((expiryTime - now) / 1000));

            setTimeLeft(diffSec);

            if (diffSec <= 0) {
                alert('증표의 보안 유효 시간이 지났습니다. 처음부터 다시 양도를 시도해주세요.');
                navigate('/me/passports');
            }
        };

        updateTimer(); // run immediately
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [transferInfo, navigate]);

    // Poll for transfer completion (receiver accepted)
    useEffect(() => {
        if (!transferInfo) return;

        const poll = setInterval(async () => {
            try {
                const active = await getActiveTransfer(passportId);
                if (!active || !active.transferToken) {
                    setTransferCompleted(true);
                    clearInterval(poll);
                }
            } catch {
                setTransferCompleted(true);
                clearInterval(poll);
            }
        }, 3000);

        return () => clearInterval(poll);
    }, [transferInfo, passportId, getActiveTransfer]);

    useEffect(() => {
        if (!currentUser) {
            setAuthError("안전한 양도를 위해 라운지 로그인이 필요합니다.");
            setTimeout(() => navigate('/login?return=/me/passports'), 3000);
        }
    }, [currentUser, navigate]);

    if (transferCompleted) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <div style={{
                    background: '#FFFFFF', borderRadius: '32px', padding: '60px 40px',
                    boxShadow: '0 20px 50px rgba(56, 161, 105, 0.1)', border: '1px solid rgba(56, 161, 105, 0.2)',
                    textAlign: 'center', maxWidth: '420px', width: '100%',
                    animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉</div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1A4D3B', marginBottom: '16px' }}>소유권 이전 완료</h2>
                    <p style={{ fontSize: '1rem', color: '#4A5568', lineHeight: '1.6', marginBottom: '30px' }}>
                        상대방이 소유권을 성공적으로 인수했습니다.<br />이전 기록이 원장에 영구 등재되었습니다.
                    </p>
                    <button
                        onClick={() => navigate('/me/passports')}
                        style={{
                            width: '100%', padding: '16px', fontSize: '1rem', fontWeight: '700', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)', color: 'white',
                            border: 'none', cursor: 'pointer'
                        }}
                    >
                        내 자산 지갑으로 이동
                    </button>
                </div>
                <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
            </div>
        );
    }

    if (authError) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '50px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: '20px' }}><ShieldCheck width={36} height={36} stroke="#E53E3E" /></div>
                    <h2 style={{ fontSize: '1.5rem', color: '#102A20', marginBottom: '16px' }}>접근 권한이 없습니다.</h2>
                    <p style={{ color: '#718096' }}>{authError}</p>
                </div>
            </div>
        );
    }

    const [showCancelPopup, setShowCancelPopup] = useState(false);

    const handleMethodSelect = async (selectedMethod) => {
        try {
            setLoading(true);
            setMethod(selectedMethod);

            const myDocsResponse = await getMyPassports();
            const myDocs = myDocsResponse.content || myDocsResponse;
            const isMine = Array.isArray(myDocs) && myDocs.find(p => p.passportId === passportId);

            if (!isMine) {
                alert("현재 로그인된 계정이 해당 제품의 소유자가 아닙니다.");
                setMethod(null);
                return;
            }

            const info = await initiateTransfer({
                passportId: passportId,
                method: selectedMethod
            });

            setTransferInfo(info);
        } catch (err) {
            alert(err.response?.data?.message || err.message || "증명 코드 발급에 실패했습니다.");
            setMethod(null);
        } finally {
            setLoading(false);
        }
    };

    const [cancelSuccess, setCancelSuccess] = useState(false);

    const transferAcceptUrl = transferInfo
        ? buildTransferAcceptUrl(window.location.origin, transferInfo.transferToken, transferInfo.code)
        : '';

    const executeCancel = async () => {
        try {
            setLoading(true);
            await useDPPStore.getState().cancelTransfer(transferInfo.transferToken);
            setMethod(null);
            setTransferInfo(null);
            setCancelSuccess(true);
        } catch (err) {
            alert("취소 처리 중 오류가 발생했습니다: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: isMobile ? '20px 12px' : '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: isMobile ? '30px 20px' : '50px 40px', width: '100%', maxWidth: '600px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ marginBottom: '16px' }}><ArrowsExchange width={32} height={32} stroke="#1A4D3B" /></div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>안전한 소유권 양도</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                        1회용 증표를 생성하여 안전하게 소유권을 이전합니다.
                    </p>
                    {/* Transfer Flow Diagram */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
                        padding: '20px', background: '#F8FAFC', borderRadius: '16px', marginBottom: '8px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F0F9F4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', border: '2px solid #1A4D3B20' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1A4D3B' }}>나</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>소유자</div>
                        </div>
                        <div style={{ color: '#CBD5E0', fontSize: '1.2rem' }}>→</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', border: '2px solid #6B4C9A20' }}>
                                <Send width={16} height={16} stroke="#6B4C9A" />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>토큰</div>
                        </div>
                        <div style={{ color: '#CBD5E0', fontSize: '1.2rem' }}>→</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', border: '2px solid #B7791F20' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#B7791F' }}>?</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>인수자</div>
                        </div>
                    </div>
                </div>

                {!method && !transferInfo && !loading && (
                    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#4A5568', marginBottom: '16px' }}>거래 방식을 선택해 주세요</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button
                                onClick={() => handleMethodSelect('IN_PERSON_QR')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: '#FAFCFB',
                                    border: '1px solid #E2E8F0', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1A4D3B'; e.currentTarget.style.background = '#F0F9F4'; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FAFCFB'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}><ScanLine width={24} height={24} stroke="#1A4D3B" /></div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#102A20', marginBottom: '4px' }}>매장 또는 직거래 (대면 만남)</div>
                                    <div style={{ fontSize: '0.9rem', color: '#718096' }}>1회용 스캔 코드를 생성하여 그 자리에서 즉시 넘겨줍니다.</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleMethodSelect('ONE_TIME_CODE')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: '#FAFCFB',
                                    border: '1px solid #E2E8F0', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1A4D3B'; e.currentTarget.style.background = '#F0F9F4'; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FAFCFB'; }}
                            >
                                <div style={{ fontSize: '2rem' }}>📦</div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#102A20', marginBottom: '4px' }}>택배 거래 (비대면)</div>
                                    <div style={{ fontSize: '0.9rem', color: '#718096' }}>공유 가능한 보안 핀코드를 발급받아 구매자에게 전달합니다.</div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', animation: 'fadeIn 0.3s' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#1A4D3B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                        <p style={{ fontWeight: '700', color: '#102A20' }}>안전하게 양도 증표를 발급 중입니다...</p>
                    </div>
                )}

                {transferInfo && (
                    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center', background: '#FAFCFB', padding: '30px', borderRadius: '20px', border: '1px solid rgba(26, 77, 59, 0.1)' }}>
                        <div style={{ color: '#38A169', fontWeight: '800', fontSize: '1.1rem', marginBottom: '20px', letterSpacing: '0.05em' }}>
                            ✓ 양도 준비가 완료되었습니다.
                        </div>

                        {method === 'IN_PERSON_QR' ? (
                            <>
                                <div style={{
                                    width: 'clamp(160px, 60vw, 240px)', height: 'clamp(160px, 60vw, 240px)', margin: '0 auto 24px', background: '#FFF',
                                    border: '1px solid #E2E8F0', borderRadius: '16px', padding: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                }}>
                                    <QRCodeSVG
                                        value={transferAcceptUrl}
                                        size={isMobile ? Math.min(window.innerWidth * 0.5, 180) : 210}
                                        bgColor={"#ffffff"}
                                        fgColor={"#102A20"}
                                        level={"M"}
                                        includeMargin={false}
                                    />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', color: '#102A20', margin: '0 0 8px 0' }}>이 화면을 양수자에게 보여주세요.</h3>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '6px',
                                    background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '2px dashed #CBD5E0',
                                    color: '#2A7258', margin: '0 auto 24px', display: 'inline-block', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    {transferInfo.code}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', color: '#102A20', margin: '0 0 8px 0' }}>양수자에게 위 시크릿 핀코드를 전달해 주세요.</h3>
                            </>
                        )}

                        <div style={{ marginTop: '24px', fontSize: '0.85rem', color: '#E53E3E', fontWeight: '600', padding: '12px', background: '#FFF5F5', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div>⚠️ 주의: 보안을 위해 이 증표는 유효기간 후 자동 파기됩니다.</div>
                            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: '2px' }}>
                                {timeLeft >= 86400
                                    ? `${Math.floor(timeLeft / 86400)}일 ${Math.floor((timeLeft % 86400) / 3600)}시간 남음`
                                    : `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`
                                }
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCancelPopup(true)}
                            style={{
                                marginTop: '16px', padding: '14px', width: '100%', fontSize: '0.95rem', fontWeight: '700',
                                background: 'transparent', color: '#E53E3E', border: '1px solid #FEB2B2', borderRadius: '12px', cursor: 'pointer'
                            }}
                        >
                            양도 절차 취소하기
                        </button>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button
                        onClick={() => navigate('/me/passports')}
                        style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '0.95rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        마이 패스포트 라운지로 돌아가기
                    </button>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelPopup && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: '#FFF', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '360px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center'
                    }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <span style={{ fontSize: '24px' }}>⚠️</span>
                        </div>
                        <h3 style={{ margin: '0 0 12px 0', color: '#102A20', fontSize: '1.2rem' }}>양도 절차 취소</h3>
                        <p style={{ color: '#718096', lineHeight: '1.5', margin: '0 0 24px 0', fontSize: '0.95rem' }}>
                            정말로 양도를 취소하시겠습니까?<br />발급된 증표는 즉시 무효화됩니다.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowCancelPopup(false)}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0',
                                    background: '#F8FAFC', color: '#4A5568', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem'
                                }}
                            >
                                아니오
                            </button>
                            <button
                                onClick={() => {
                                    setShowCancelPopup(false);
                                    executeCancel();
                                }}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                                    background: '#E53E3E', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem'
                                }}
                            >
                                네, 취소합니다
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Success Modal */}
            {cancelSuccess && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: '#FFF', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '360px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center'
                    }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F0F9F4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <span style={{ fontSize: '24px' }}>✅</span>
                        </div>
                        <h3 style={{ margin: '0 0 12px 0', color: '#102A20', fontSize: '1.2rem' }}>취소 완료</h3>
                        <p style={{ color: '#718096', lineHeight: '1.5', margin: '0 0 24px 0', fontSize: '0.95rem' }}>
                            양도 신청이 완전하게 취소되었습니다.
                        </p>
                        <button
                            onClick={() => setCancelSuccess(false)}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                background: '#1A4D3B', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem'
                            }}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Screen6TransferStart;

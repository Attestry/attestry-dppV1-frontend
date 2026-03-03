import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { ArrowsExchange, Package } from '../components/Icons';
import { getPublicPassportApi } from '../api';

const Screen3RetailIssue = () => {
    const [qrCodeInput, setQrCodeInput] = useState('');
    const [tradeType, setTradeType] = useState('DIRECT'); // DIRECT or ONLINE
    const [generatedCode, setGeneratedCode] = useState(null); // OTC-XXXX format for CODE
    const [generatedToken, setGeneratedToken] = useState(null); // tk_xxxx format for QR links
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { currentUser, initiateTransfer } = useDPPStore();

    if (currentUser?.role !== 'RETAIL') {
        return (
            <div style={{
                minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
            }}>
                <div style={{
                    background: '#FFFFFF', borderRadius: '32px', padding: '50px 40px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.06)', textAlign: 'center', maxWidth: '460px', width: '100%'
                }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '24px' }}>🚫</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#102A20', marginBottom: '16px' }}>접근 권한 없음</h2>
                    <p style={{ fontSize: '1.05rem', color: '#4A5568', lineHeight: '1.6', marginBottom: '36px' }}>해당 기능은 판매처(RETAIL)만 사용 가능한 기능입니다.</p>
                    <button onClick={() => navigate('/')} style={{
                        padding: '16px 24px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)', color: '#ffffff',
                        border: 'none', cursor: 'pointer', width: '100%'
                    }}>홈으로 돌아가기</button>
                </div>
            </div>
        );
    }

    const handleIssue = async () => {
        if (!currentUser || currentUser.role !== 'RETAIL') return;
        if (!qrCodeInput.trim()) {
            alert("제품 식별 코드를 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            let pRes;
            try {
                pRes = await getPublicPassportApi(qrCodeInput);
            } catch (lookupErr) {
                alert("해당 QR 코드(" + qrCodeInput + ")에 해당하는 제품이 존재하지 않습니다.\n브랜드가 먼저 제품을 등록(Mint)해야 합니다.");
                return;
            }
            const passport = pRes.data;

            const method = tradeType === 'DIRECT' ? 'IN_PERSON_QR' : 'ONE_TIME_CODE';

            const res = await initiateTransfer({
                passportId: passport.passportId || qrCodeInput,
                method: method,
                receiptNumber: "N/A",
                evidenceUrls: "[]"
            });

            if (method === 'IN_PERSON_QR') {
                setGeneratedToken(res.transferToken);
            } else {
                setGeneratedCode(res.code ? ("OTC-" + res.code) : "OTC-UNKNOWN");
            }
        } catch (e) {
            alert("발급 실패: " + (e.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '600px',
                boxShadow: '0 12px 30px rgba(26, 77, 59, 0.05)', border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🏷️</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>클레임 증표 발급</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: 0 }}>
                        판매할 제품의 고유 식별 코드를 입력하고,<br />구매자가 소유권을 연동할 수 있는 1회용 증표를 생성합니다.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#4A5568', marginBottom: '10px' }}>
                        1. 대상 제품 식별 코드 (QR 스캔값)
                    </label>
                    <input
                        value={qrCodeInput}
                        onChange={(e) => setQrCodeInput(e.target.value)}
                        placeholder="제품 QR 코드를 입력하세요 (예: QRXXXXXX)"
                        disabled={generatedToken || generatedCode}
                        style={{
                            width: '100%', padding: '16px 20px', fontSize: '1.1rem', borderRadius: '12px',
                            border: '1px solid #E2E8F0', backgroundColor: (generatedToken || generatedCode) ? '#F7FAFC' : '#FFFFFF',
                            outline: 'none', transition: 'all 0.2s', letterSpacing: '0.1em'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#4A5568', marginBottom: '10px' }}>
                        2. 고객 구매 방식 선택
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setTradeType('DIRECT')}
                            disabled={generatedToken || generatedCode}
                            style={{
                                flex: 1, padding: '16px', fontSize: '1rem', fontWeight: '600', borderRadius: '12px',
                                border: tradeType === 'DIRECT' ? '2px solid #1A4D3B' : '1px solid #E2E8F0',
                                backgroundColor: tradeType === 'DIRECT' ? '#F0F9F4' : '#FFFFFF',
                                color: tradeType === 'DIRECT' ? '#1A4D3B' : '#718096',
                                cursor: (generatedToken || generatedCode) ? 'default' : 'pointer',
                                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}><ArrowsExchange width={20} height={20} stroke="#1A4D3B" /></span>
                            오프라인 매장 결제
                        </button>
                        <button
                            onClick={() => setTradeType('ONLINE')}
                            disabled={generatedToken || generatedCode}
                            style={{
                                flex: 1, padding: '16px', fontSize: '1rem', fontWeight: '600', borderRadius: '12px',
                                border: tradeType === 'ONLINE' ? '2px solid #1A4D3B' : '1px solid #E2E8F0',
                                backgroundColor: tradeType === 'ONLINE' ? '#F0F9F4' : '#FFFFFF',
                                color: tradeType === 'ONLINE' ? '#1A4D3B' : '#718096',
                                cursor: (generatedToken || generatedCode) ? 'default' : 'pointer',
                                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}><Package width={20} height={20} stroke="#6B4C9A" /></span>
                            온라인 택배 발송
                        </button>
                    </div>
                </div>

                {!generatedToken && !generatedCode ? (
                    <button
                        onClick={handleIssue}
                        disabled={loading || !qrCodeInput}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '16px',
                            background: (loading || !qrCodeInput) ? '#CBD5E0' : 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                            color: 'white', border: 'none', cursor: (loading || !qrCodeInput) ? 'not-allowed' : 'pointer',
                            boxShadow: (loading || !qrCodeInput) ? 'none' : '0 8px 20px rgba(26, 77, 59, 0.2)',
                            transition: 'all 0.3s'
                        }}
                    >
                        {loading ? '안전하게 권한을 생성 중입니다...' : '클레임 증표 생성하기'}
                    </button>
                ) : (
                    <div style={{
                        background: '#FAFCFB', border: '2px solid #38A169', borderRadius: '16px', padding: '30px',
                        textAlign: 'center', animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <div style={{ color: '#38A169', fontWeight: '800', fontSize: '1.1rem', marginBottom: '20px', letterSpacing: '0.05em' }}>
                            난수 코드 발급 완료
                        </div>

                        {tradeType === 'DIRECT' ? (
                            <>
                                <div style={{
                                    width: '180px', height: '180px', margin: '0 auto 20px', background: '#FFF',
                                    border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {/* Mock visually appealing QR code layout */}
                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', opacity: 0.8 }}></div>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', color: '#102A20', margin: '0 0 8px 0' }}>임시 QR 코드가 생성되었습니다.</h3>
                                <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0 0 24px 0' }}>매장에 방문한 고객에게 위 화면을 스캔하도록 안내해 주세요.</p>

                                <button
                                    onClick={() => navigate(`/claim/${generatedToken}`)}
                                    style={{
                                        padding: '12px 24px', fontSize: '0.9rem', fontWeight: '600', borderRadius: '8px',
                                        background: '#E2E8F0', color: '#4A5568', border: 'none', cursor: 'pointer', width: '100%'
                                    }}
                                >
                                    [테스트용 이동] 고객 시점 화면 보기
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    fontSize: '2rem', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '4px',
                                    background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '2px dashed #CBD5E0',
                                    color: '#2A7258', margin: '0 auto 20px', display: 'inline-block'
                                }}>
                                    {generatedCode}
                                </div>
                                <h3 style={{ fontSize: '1.2rem', color: '#102A20', margin: '0 0 8px 0' }}>동봉용 시크릿 코드가 생성되었습니다.</h3>
                                <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0 }}>이 코드를 택배 보증서에 기입하거나 고객의 연락처로 전송해 주세요.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default Screen3RetailIssue;

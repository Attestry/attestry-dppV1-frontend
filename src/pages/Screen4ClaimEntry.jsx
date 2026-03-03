import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { Lock, Key, Camera } from '../components/Icons';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { extractTransferCredential } from '../utils/qrPayload';

const Screen4ClaimEntry = () => {
    const [tradeType, setTradeType] = useState('DIRECT'); // DIRECT or ONLINE
    const [token, setToken] = useState('');
    const [scannerActive, setScannerActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const scannerRef = useRef(null);
    const [cameraBlocked, setCameraBlocked] = useState(false);

    const navigate = useNavigate();
    const { currentUser, acceptTransfer, getTransferDetails } = useDPPStore();

    const claimAsset = async (tokenOrCode) => {
        try {
            await acceptTransfer(tokenOrCode.trim());
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    };

    const handleProceedCode = async () => {
        if (!token) return;
        setLoading(true);
        try {
            await getTransferDetails(token.trim());
            navigate(`/claim/${token.trim()}`);
        } catch (error) {
            alert("조회 실패: 올바르지 않은 코드이거나 이미 등록이 완료되었습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleManualScanStart = () => {
        if (!currentUser) {
            alert("보안을 위해 먼저 내 패스포트 라운지에 입장(로그인)해야 합니다.");
            navigate('/login?return=/claim-entry');
            return;
        }
        setScannerActive(true);
    };

    const processScannedToken = async (scannedValue) => {
        const { tokenOrCode } = extractTransferCredential(scannedValue);
        if (!tokenOrCode) {
            alert("유효한 양도 QR이 아닙니다.");
            setScannerActive(false);
            return;
        }
        setLoading(true);
        try {
            const res = await getTransferDetails(tokenOrCode);
            if (res.status !== 'PENDING') {
                alert("이미 누군가에게 등록이 완료되었거나, 유효하지 않은 QR 코드입니다.");
                setScannerActive(false);
                setLoading(false);
                return;
            }

            await claimAsset(tokenOrCode);
            setSuccessMsg("완벽합니다! 🥂 소유권 등록이 안전하게 완료되었습니다.");
            setScannerActive(false);
            setLoading(false);
            setTimeout(() => navigate('/me/passports'), 3000);
        } catch (err) {
            alert("등록 실패: " + (err.response?.data?.message || err.message));
            setScannerActive(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        const isCameraSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        if (!isCameraSupported) {
            setCameraBlocked(true);
            return;
        }

        if (!scannerActive || tradeType !== 'DIRECT' || loading) {
            return;
        }

        let isMounted = true;
        const startScanner = () => {
            if (!isMounted || scannerRef.current || !document.getElementById('qr-reader-claim')) return;

            try {
                const scanner = new Html5QrcodeScanner(
                    "qr-reader-claim",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        rememberLastUsedCamera: true,
                        supportedScanTypes: [0]
                    },
                    false
                );

                scannerRef.current = scanner;

                scanner.render(
                    (decodedText) => {
                        if (scannerRef.current) {
                            scannerRef.current.clear().catch(e => console.error(e));
                            scannerRef.current = null;
                        }
                        processScannedToken(decodedText);
                    },
                    (error) => { } // ignore scan errors
                );
            } catch (err) {
                console.error("Scanner setup failed:", err);
            }
        };

        const timerId = setTimeout(startScanner, 200);

        return () => {
            isMounted = false;
            clearTimeout(timerId);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error(e));
                scannerRef.current = null;
            }
        };
    }, [scannerActive, tradeType, loading]);

    // Success Screen
    if (successMsg) {
        return (
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FAFCFB',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px',
                zIndex: 100
            }}>
                <div style={{
                    background: '#FFFFFF', borderRadius: '32px', padding: '60px 40px',
                    boxShadow: '0 20px 50px rgba(56, 161, 105, 0.1)', border: '1px solid rgba(56, 161, 105, 0.2)',
                    textAlign: 'center', maxWidth: '420px', width: '100%',
                    animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <div style={{ marginBottom: '20px' }}><Lock width={48} height={48} stroke="#1A4D3B" /></div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1A4D3B', marginBottom: '16px' }}>소유권 장착 완료</h2>
                    <p style={{ fontSize: '1.05rem', color: '#4A5568', lineHeight: '1.6', marginBottom: '30px', fontWeight: '500' }}>
                        {successMsg}
                    </p>
                    <div style={{
                        width: '30px', height: '30px', border: '3px solid rgba(26, 77, 59, 0.1)',
                        borderTopColor: '#1A4D3B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#A0AEC0' }}>라운지로 이동 중입니다...</p>
                </div>
                <style>{`
                    @keyframes scaleIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '600px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ marginBottom: '16px' }}><Key width={28} height={28} stroke="#6B4C9A" /></div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>소유권 이전</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: 0 }}>
                        판매처에서 안내받은 방식에 따라 소유권을 인증하고,<br />본인 계정의 디지털 자산 지갑에 안전하게 이전하세요.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '8px', background: '#F7FAFC', padding: '6px', borderRadius: '16px' }}>
                        <button
                            onClick={() => setTradeType('DIRECT')}
                            style={{
                                flex: 1, padding: '14px', fontSize: '0.95rem', fontWeight: '700', borderRadius: '12px',
                                background: tradeType === 'DIRECT' ? '#FFFFFF' : 'transparent',
                                color: tradeType === 'DIRECT' ? '#1A4D3B' : '#A0AEC0', border: 'none',
                                boxShadow: tradeType === 'DIRECT' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <span>📷</span> 매장 스캔 등록
                        </button>
                        <button
                            onClick={() => setTradeType('ONLINE')}
                            style={{
                                flex: 1, padding: '14px', fontSize: '0.95rem', fontWeight: '700', borderRadius: '12px',
                                background: tradeType === 'ONLINE' ? '#FFFFFF' : 'transparent',
                                color: tradeType === 'ONLINE' ? '#1A4D3B' : '#A0AEC0', border: 'none',
                                boxShadow: tradeType === 'ONLINE' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <span>✍️</span> 시크릿 코드 등록
                        </button>
                    </div>
                </div>

                <div style={{ background: '#FAFCFB', padding: '30px', borderRadius: '16px', border: '1px solid rgba(26,77,59,0.05)' }}>
                    {tradeType === 'DIRECT' ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.95rem', color: '#4A5568', marginBottom: '24px', fontWeight: '500' }}>
                                직원이 제시한 QR 코드를 카메라로 스캔해주세요.
                            </p>

                            {scannerActive ? (
                                cameraBlocked ? (
                                    <div style={{ textAlign: 'center', color: '#E53E3E', fontSize: '0.9rem', lineHeight: '1.5', background: '#FFF5F5', padding: '20px', borderRadius: '16px', border: '1px solid #E53E3E' }}>
                                        ⚠️ <b>카메라 권한 차단됨</b><br /><br />
                                        로컬 네트워크(http) 접근이거나 브라우저에서 카메라 권한이 차단되었습니다. 모바일 기기는 <b>https</b> 환경이 필수입니다.<br /><br />
                                        <button onClick={() => setTradeType('ONLINE')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E53E3E', background: '#FFFFFF', color: '#E53E3E', cursor: 'pointer', marginTop: '10px' }}>
                                            시크릿 코드로 전환하기
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', overflow: 'hidden', borderRadius: '16px', border: '2px solid #E2E8F0', background: '#000' }}>
                                        <div id="qr-reader-claim" style={{ width: '100%' }}></div>
                                    </div>
                                )
                            ) : (
                                <div
                                    onClick={handleManualScanStart}
                                    style={{
                                        width: '100%', height: '240px', background: '#FFFFFF', border: '2px dashed #CBD5E0',
                                        borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', transition: 'all 0.2s', gap: '12px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#1A4D3B'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E0'}
                                >
                                    <span><Camera width={36} height={36} stroke="#A0AEC0" /></span>
                                    <span style={{ color: '#4A5568', fontWeight: '600' }}>여기를 눌러 스캐너 켜기</span>
                                </div>
                            )}

                            <div style={{ fontSize: '0.8rem', color: '#A0AEC0', marginTop: '20px', background: '#EDF2F7', padding: '10px', borderRadius: '8px' }}>
                                로그인 계정: <strong>{currentUser?.email || '비로그인'}</strong><br />스캔 성공 시 즉시 해당 계정으로 안전하게 귀속됩니다.
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.95rem', color: '#4A5568', marginBottom: '24px', fontWeight: '500' }}>
                                택배 보증서 또는 문자로 전달받은 코드를 정확히 입력해 주세요.
                            </p>

                            <input
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="예: OTC-ABCD12"
                                style={{
                                    width: '100%', padding: '20px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px', fontWeight: '700',
                                    borderRadius: '12px', border: '2px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s',
                                    color: '#102A20', marginBottom: '24px'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />

                            <button
                                onClick={handleProceedCode}
                                disabled={loading || !token.trim()}
                                style={{
                                    width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '12px',
                                    background: (loading || !token.trim()) ? '#CBD5E0' : '#1A4D3B', color: 'white',
                                    border: 'none', cursor: (loading || !token.trim()) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s', boxShadow: (loading || !token.trim()) ? 'none' : '0 8px 15px rgba(26, 77, 59, 0.2)'
                                }}
                            >
                                {loading ? '안전하게 확인 중...' : '코드 인증 및 등록하기'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }`}</style>
        </div>
    );
};

export default Screen4ClaimEntry;

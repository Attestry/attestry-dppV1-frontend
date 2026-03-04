import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { extractTransferCredential } from '../utils/qrPayload';
import { useIsMobile } from '../hooks/useIsMobile';

const Screen7TransferAccept = () => {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { currentUser, acceptTransfer } = useDPPStore();

    const isMobile = useIsMobile();
    const [codeInput, setCodeInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanMode, setScanMode] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);

    const isCodeInputMode = pathname.includes('/transfer/code') || (!token && !scanMode);

    const scannerRef = useRef(null);
    const [cameraBlocked, setCameraBlocked] = useState(false);

    const handleAcceptDirectly = async (rawPayload) => {
        const { tokenOrCode } = extractTransferCredential(rawPayload);
        if (!tokenOrCode) {
            alert('인식할 수 없는 QR/코드 형식입니다. 다시 시도해 주세요.');
            return;
        }

        if (!currentUser) {
            const returnPath = `/transfer/code?payload=${encodeURIComponent(tokenOrCode)}`;
            navigate(`/login?return=${encodeURIComponent(returnPath)}`);
            return;
        }

        setLoading(true);
        try {
            await acceptTransfer(tokenOrCode);
            setSuccessMessage({
                title: '소유권 이관 완료',
                message: '제품의 소유권이 회원님 계정으로 안전하게 이관되었습니다.'
            });
        } catch (e) {
            alert('이관 실패: ' + (e.response?.data?.message || e.message));
            setScanMode(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const tParam = searchParams.get('t');
        const cParam = searchParams.get('c');
        const payloadParam = searchParams.get('payload');

        if (payloadParam && currentUser) {
            handleAcceptDirectly(payloadParam);
            return;
        }

        if ((tParam || cParam) && currentUser) {
            const reconstructed = `${window.location.origin}/transfer/accept?t=${tParam || ''}&c=${cParam || ''}`;
            handleAcceptDirectly(reconstructed);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, currentUser]);

    const handleMobileFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!currentUser) {
            const returnPath = `/transfer/accept`;
            navigate(`/login?return=${encodeURIComponent(returnPath)}`);
            return;
        }

        setLoading(true);
        const tempDivId = 'mobile-qr-temp-transfer';
        try {
            const html5QrCode = new Html5Qrcode(tempDivId);
            const result = await html5QrCode.scanFile(file, true);
            handleAcceptDirectly(result);
        } catch (err) {
            alert("QR 인식 실패: 더 선명한 사진을 찍거나 QR 코드 전체가 보이도록 찍어주세요.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isMobile) return; // Mobile uses native camera input

        const isCameraSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        if (!isCameraSupported) {
            setCameraBlocked(true);
            return;
        }

        if (!scanMode || loading || searchParams.get('payload') || searchParams.get('c')) {
            return;
        }

        let isMounted = true;

        const startScanner = () => {
            if (!isMounted || scannerRef.current || !document.getElementById('qr-reader')) return;

            try {
                const scanner = new Html5QrcodeScanner(
                    'qr-reader',
                    {
                        fps: 12,
                        qrbox: { width: 280, height: 280 },
                        rememberLastUsedCamera: true,
                        supportedScanTypes: [0]
                    },
                    false
                );

                scannerRef.current = scanner;

                scanner.render(
                    (decodedText) => {
                        if (scannerRef.current) {
                            scannerRef.current.clear().catch(() => { });
                            scannerRef.current = null;
                        }
                        handleAcceptDirectly(decodedText);
                    },
                    () => { }
                );
            } catch (err) {
                console.error('Scanner setup failed:', err);
            }
        };

        const timerId = setTimeout(startScanner, 200);

        return () => {
            isMounted = false;
            clearTimeout(timerId);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => { });
                scannerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scanMode, loading, searchParams, isMobile]);

    const handleAccept = async () => {
        const manual = codeInput.trim();
        const fallback = token || '';
        const tokenOrCode = manual || fallback;

        if (!tokenOrCode) {
            alert('정확한 증표 토큰 또는 핀 코드를 입력해주세요.');
            return;
        }

        await handleAcceptDirectly(tokenOrCode);
    };

    return (
        <>
        <div id="mobile-qr-temp-transfer" style={{ display: 'none' }} />
        <div style={{ padding: isMobile ? '20px 12px' : '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: isMobile ? '30px 20px' : '50px 40px', width: '100%', maxWidth: '500px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔑</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>소유권 양수 및 이관</h2>

                {!scanMode ? (
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: '0 0 30px 0' }}>
                        이전 소유자로부터 전달받은 토큰 또는 코드를 입력하여 소유권 이관 절차를 마무리하세요.
                    </p>
                ) : (
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: '0 0 30px 0' }}>
                        카메라를 사용하여 이전 소유자의 1회용 QR 코드를 스캔하세요.
                    </p>
                )}

                {scanMode && !loading && !searchParams.get('payload') && !searchParams.get('c') && (
                    isMobile ? (
                        <div style={{ marginBottom: '30px' }}>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                id="mobile-camera-transfer"
                                style={{ display: 'none' }}
                                onChange={handleMobileFileChange}
                            />
                            <label
                                htmlFor="mobile-camera-transfer"
                                style={{
                                    display: 'block', padding: '24px', background: '#F0F9F4', border: '2px dashed #2A7258',
                                    borderRadius: '16px', cursor: 'pointer', textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📷</div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1A4D3B', marginBottom: '6px' }}>카메라로 QR 스캔</div>
                                <div style={{ fontSize: '0.85rem', color: '#718096' }}>터치하여 카메라 앱으로 QR 코드를 촬영하세요</div>
                            </label>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '30px', overflow: 'hidden', borderRadius: '16px', border: '2px solid #E2E8F0', padding: cameraBlocked ? '20px' : '0' }}>
                            {cameraBlocked ? (
                                <div style={{ textAlign: 'center', color: '#E53E3E', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    ⚠️ <b>카메라 권한 차단됨</b><br /><br />
                                    모바일/브라우저에서 카메라 권한을 허용하거나 HTTPS 환경에서 다시 시도해 주세요.
                                    <br /><br />
                                    <button onClick={() => setScanMode(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E53E3E', background: '#FFF5F5', color: '#E53E3E', cursor: 'pointer', marginTop: '10px' }}>
                                        수동으로 코드 입력하기
                                    </button>
                                </div>
                            ) : (
                                <div id="qr-reader" style={{ width: '100%' }}></div>
                            )}
                        </div>
                    )
                )}

                {!scanMode && (
                    <div style={{ marginBottom: '30px' }}>
                        <input
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value.trim())}
                            placeholder="예: tr_xxx 또는 ABC123"
                            style={{
                                width: '100%', padding: '20px', fontSize: '1.1rem', textAlign: 'center', letterSpacing: '1px', fontWeight: '700',
                                borderRadius: '12px', border: '2px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s',
                                color: '#102A20'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>
                )}

                {!searchParams.get('payload') && !searchParams.get('c') && (
                    <button
                        onClick={() => setScanMode(!scanMode)}
                        style={{
                            background: 'none', border: 'none', color: '#4A5568', textDecoration: 'underline',
                            cursor: 'pointer', marginBottom: '20px', fontSize: '0.9rem'
                        }}
                    >
                        {scanMode ? '카메라가 작동하지 않나요? 코드 수동 입력하기' : 'QR 카메라 스캐너 사용하기'}
                    </button>
                )}

                {!scanMode && (
                    <button
                        onClick={handleAccept}
                        disabled={loading || codeInput.length < 4}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '16px',
                            background: (loading || codeInput.length < 4) ? '#CBD5E0' : 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                            color: 'white', border: 'none', cursor: (loading || codeInput.length < 4) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s', boxShadow: (loading || codeInput.length < 4) ? 'none' : '0 8px 15px rgba(26, 77, 59, 0.2)'
                        }}
                    >
                        {loading ? '신원 확인 및 이관 중...' : '안전하게 양수하기'}
                    </button>
                )}
            </div>

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
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>{successMessage.title}</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.6', marginBottom: '32px' }}>{successMessage.message}</p>
                        <button
                            onClick={() => {
                                setSuccessMessage(null);
                                navigate('/me/passports');
                            }}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#102A20',
                                color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                        >
                            여권 목록으로 이동
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
        </>
    );
};

export default Screen7TransferAccept;

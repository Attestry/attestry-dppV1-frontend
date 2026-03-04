import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { FolderOpen, Lock } from '../components/Icons';
import { QRCodeSVG } from 'qrcode.react';
import { useIsMobile } from '../hooks/useIsMobile';

const EventItem = ({ ev, idx, isLast, translateAction }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div style={{
            position: 'relative', display: 'flex', gap: '24px', marginBottom: isLast ? 0 : '30px',
            zIndex: 1
        }}>
            {/* Timeline Dot */}
            <div style={{
                width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, marginTop: '6px',
                background: ev.action === 'MINTED' ? '#38A169' : (ev.action === 'CLAIMED' ? '#8B5CF6' : '#2A7258'),
                boxShadow: `0 0 0 4px #FAFCFB, 0 0 0 6px ${ev.action === 'MINTED' ? 'rgba(56, 161, 105, 0.2)' : 'rgba(139, 92, 246, 0.2)'}`
            }}></div>

            {/* Event Content */}
            <div style={{
                background: '#FFFFFF', padding: '20px', borderRadius: '16px', flex: 1,
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)'
            }}>
                <div style={{
                    fontSize: '0.75rem', color: '#A0AEC0', fontWeight: '600', marginBottom: '6px',
                    letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                    {ev.date}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1A1D20', marginBottom: '4px' }}>
                    {translateAction(ev.action)}
                </div>
                {ev.actorName && (
                    <div style={{ fontSize: '0.85rem', color: '#4A5568', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>수행자:</span>
                        <span style={{ fontWeight: '600', color: '#2D3748' }}>{ev.actorName}</span>
                    </div>
                )}

                {/* Basic Hash Display */}
                <div style={{
                    fontSize: '0.75rem', color: '#718096', background: '#F7FAFC', padding: '6px 10px',
                    borderRadius: '8px', wordBreak: 'break-all', fontFamily: 'monospace', marginBottom: '12px'
                }}>
                    증명 요약: {ev.hash ? ev.hash : '생성 중...'}
                </div>

                {/* Expandable Details Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: 'none', border: '1px solid rgba(26, 77, 59, 0.1)', borderRadius: '8px',
                        padding: '6px 12px', fontSize: '0.8rem', color: '#1A4D3B', fontWeight: '600',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center'
                    }}
                >
                    원장 상세 정보 {isExpanded ? '▲' : '▼'}
                </button>

                {/* Expanded Details Panel */}
                {isExpanded && (
                    <div style={{
                        marginTop: '12px', padding: '12px', background: '#F7FAFC', borderRadius: '8px',
                        border: '1px solid #EDF2F7', fontSize: '0.75rem', fontFamily: 'monospace', color: '#4A5568',
                        wordBreak: 'break-all'
                    }}>
                        <strong style={{ color: '#2D3748' }}>Transaction Hash:</strong><br />
                        <span style={{ color: '#3182CE' }}>{ev.hash}</span><br /><br />

                        {ev.prevHash && (
                            <>
                                <strong style={{ color: '#2D3748' }}>Previous Hash:</strong><br />
                                <span style={{ color: '#718096' }}>{ev.prevHash}</span><br /><br />
                            </>
                        )}

                        {ev.correlationId && (
                            <>
                                <strong style={{ color: '#2D3748' }}>Correlation ID:</strong><br />
                                <span style={{ color: '#805AD5' }}>{ev.correlationId}</span><br /><br />
                            </>
                        )}

                        <strong style={{ color: '#2D3748' }}>Data Payload:</strong><br />
                        <pre style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap', color: '#38A169' }}>
                            {(() => {
                                try {
                                    return ev.dataJson ? JSON.stringify(JSON.parse(ev.dataJson), null, 2) : '{}';
                                } catch (e) {
                                    return ev.dataJson || '{}';
                                }
                            })()}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

const Screen1PublicPassport = () => {
    const { qrPublicCode } = useParams();
    const navigate = useNavigate();
    const { getPublicPassport, currentUser } = useDPPStore();
    const isMobile = useIsMobile();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const trimmedCode = qrPublicCode ? qrPublicCode.trim() : "";

        getPublicPassport(trimmedCode)
            .then(res => {
                if (isMounted) setData(res);
            })
            .catch(err => {
                const message = err.response?.data?.message || err.message;
                if (isMounted) setError(message);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [qrPublicCode, getPublicPassport]);

    // Premium Skeleton Loader
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#FAFCFB',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{
                    width: '60px', height: '60px',
                    border: '3px solid rgba(26, 77, 59, 0.1)',
                    borderTopColor: '#1A4D3B',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <div style={{ marginTop: '20px', color: '#1A4D3B', fontWeight: '600', letterSpacing: '2px' }}>VERIFYING AUTHENTICITY...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{
                minHeight: '100vh', backgroundColor: '#FAFCFB', color: '#1A1D20',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>인증서를 찾을 수 없습니다</h2>
                <p style={{ color: '#4A5568', textAlign: 'center', marginBottom: '30px' }}>
                    유효하지 않은 QR 코드이거나, 아직 등록되지 않은 제품입니다.
                </p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '14px 32px', borderRadius: '50px', background: '#1A4D3B', color: 'white', border: 'none',
                        fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 20px rgba(26, 77, 59, 0.2)'
                    }}
                >
                    홈으로 돌아가기
                </button>
            </div>
        );
    }

    const events = data.ledgerEvents || [];

    // Helper to translate event actions nicely
    const translateAction = (action) => {
        if (action === 'MINTED') return '제품 제조 및 검수 완료';
        if (action === 'RELEASED') return '공식 브랜드 출고';
        if (action === 'CLAIMED') return '소유권 최초 등록';
        if (action === 'TRANSFERRED') return '소유권 안전 이전';
        if (action === 'TRANSFER_COMPLETED') return '소유권 이전 확정';
        if (action === 'SERVICE_CONFIRMED') return '정품 서비스/수리 완료';
        return action;
    };

    // Construct the public URL for the QR code
    const publicUrl = `${window.location.origin}/p/${data.qrPublicCode || qrPublicCode}`;

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            backgroundColor: '#FAFCFB',
            color: '#1A1D20',
            fontFamily: "'Inter', 'Noto Sans KR', sans-serif"
        }}>
            {/* Hero Section with Blur/Gradient Background imitating a luxury product environment */}
            <div style={{
                position: 'relative',
                width: '100%',
                minHeight: isMobile ? 'clamp(280px, 50vh, 400px)' : '55vh',
                background: 'linear-gradient(135deg, #102A20 0%, #1A4D3B 50%, #2A7258 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '30px 16px 50px' : '40px 20px 60px',
                overflow: 'visible'
            }}>
                {/* Decorative floating orbs — hidden on mobile for performance */}
                {!isMobile && <>
                <div style={{
                    position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(162, 133, 222, 0.4) 0%, transparent 70%)',
                    filter: 'blur(40px)'
                }}></div>
                <div style={{
                    position: 'absolute', bottom: '-20%', left: '-10%', width: '250px', height: '250px',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
                    filter: 'blur(30px)'
                }}></div>
                </>}

                <div style={{
                    color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', letterSpacing: '0.2em', fontWeight: '600', marginBottom: '16px',
                    zIndex: 2, textTransform: 'uppercase'
                }}>
                    Official Digital Twin
                </div>

                {/* Glassmorphism Product Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '24px',
                    padding: '30px',
                    width: '90%',
                    maxWidth: '400px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    {/* Product Image or Public QR Code Container */}
                    <div style={{
                        width: 'clamp(140px, 55vw, 240px)', height: 'clamp(140px, 55vw, 240px)',
                        borderRadius: '24px', background: '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)', marginBottom: '24px', overflow: 'hidden',
                        padding: data.imageUrl ? '0' : '12px',
                        position: 'relative'
                    }}>
                        {data.imageUrl ? (
                            <img
                                src={data.imageUrl}
                                alt={data.modelName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div style={{
                            display: data.imageUrl ? 'none' : 'flex',
                            width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <QRCodeSVG
                                value={publicUrl}
                                size={isMobile ? Math.min(window.innerWidth * 0.45, 160) : 180}
                                bgColor={"#ffffff"}
                                fgColor={"#102A20"}
                                level={"H"}
                                includeMargin={false}
                            />
                        </div>

                        {data.imageUrl && (
                            <div style={{
                                position: 'absolute', bottom: '12px', right: '12px',
                                background: 'white', padding: '6px', borderRadius: '8px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}>
                                <QRCodeSVG value={publicUrl} size={40} />
                            </div>
                        )}
                    </div>

                    <p style={{
                        fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', margin: '-12px 0 20px 0',
                        textAlign: 'center', fontWeight: '500', letterSpacing: '0.05em'
                    }}>
                        스캔하여 정품 증명서를 확인하세요
                    </p>

                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FFF', margin: '0 0 8px 0', textAlign: 'center' }}>
                        {data.modelName}
                    </h2>

                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 16px 0', textAlign: 'center', lineHeight: '1.5' }}>
                        등록 번호: {data.modelNumber} <br />
                        {data.color} · {data.size}
                    </p>

                    <div style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '0.8rem', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>현재 소유자</span>
                        <span style={{ fontSize: '1.05rem', color: '#FFFFFF', fontWeight: '700', letterSpacing: '0.05em' }}>
                            {data.currentOwnerName || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div style={{
                padding: '60px 24px 120px 24px', // Extra padding bottom for sticky bar
                maxWidth: '600px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ textAlign: 'center', margin: '40px 0' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#102A20', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>제품 생애 주기 이력</h3>
                    <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0 }}>
                        이 제품의 제조부터 현재까지의 모든 중요 기록은 암호화되어 안전하게 보관됩니다.
                    </p>
                </div>

                <div style={{ position: 'relative', paddingLeft: '20px' }}>
                    {/* Vertical Line */}
                    <div style={{
                        position: 'absolute', top: '10px', bottom: '10px', left: '26px',
                        width: '2px', background: 'rgba(26, 77, 59, 0.1)', zIndex: 0
                    }}></div>

                    {events.length === 0 ? (
                        <div style={{
                            padding: '30px', textAlign: 'center', background: '#FFF', borderRadius: '16px',
                            border: '1px dashed rgba(26, 77, 59, 0.2)', color: '#A0AEC0'
                        }}>
                            아직 기록된 이력이 없습니다.
                        </div>
                    ) : (
                        events.map((ev, idx) => (
                            <EventItem
                                key={idx}
                                ev={ev}
                                idx={idx}
                                isLast={idx === events.length - 1}
                                translateAction={translateAction}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(0,0,0,0.05)',
                padding: `20px 24px max(20px, env(safe-area-inset-bottom, 20px)) 24px`,
                display: 'flex', justifyContent: 'center',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.03)',
                zIndex: 10
            }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    {!currentUser ? (
                        <button
                            onClick={() => navigate(`/login?return=/p/${qrPublicCode}`)}
                            style={{
                                width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700',
                                borderRadius: '16px', background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                                color: 'white', border: 'none', cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(26, 77, 59, 0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}><Lock width={16} height={16} /></span> 이 제품의 소유자 등록하기
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(`/me/passports`)}
                            style={{
                                width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700',
                                borderRadius: '16px', background: '#FFFFFF',
                                color: '#1A4D3B', border: '2px solid rgba(26, 77, 59, 0.2)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <span>📂</span> 내 패스포트 라운지로 가기
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Screen1PublicPassport;

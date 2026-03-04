import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import Pagination from '../components/Pagination';
import { Lock, FolderOpen, Clock, CheckCircle, XCircle, Package, Inbox } from '../components/Icons';
import { useIsMobile } from '../hooks/useIsMobile';

const Screen5MyPassports = () => {
    const navigate = useNavigate();
    const { currentUser, getMyPassports, getMyRegistrations } = useDPPStore();
    const isMobile = useIsMobile();

    const [myPassports, setMyPassports] = useState([]);
    const [totalPassports, setTotalPassports] = useState(0);
    const [totalPassportPages, setTotalPassportPages] = useState(1);

    const [myRequests, setMyRequests] = useState([]);
    const [totalReqPages, setTotalReqPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [passportPage, setPassportPage] = useState(1);
    const [reqPage, setReqPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const [dismissedIds, setDismissedIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('dpp-dismissed-reqs') || '[]'); } catch { return []; }
    });

    const handleDismiss = (requestId) => {
        const updated = [...dismissedIds, requestId];
        setDismissedIds(updated);
        localStorage.setItem('dpp-dismissed-reqs', JSON.stringify(updated));
    };

    const extractPageMeta = (payload) => {
        if (!payload || Array.isArray(payload)) {
            return { totalElements: Array.isArray(payload) ? payload.length : 0, totalPages: 1 };
        }
        const pageInfo = payload.page || {};
        return {
            totalElements: pageInfo.totalElements ?? payload.totalElements ?? 0,
            totalPages: pageInfo.totalPages ?? payload.totalPages ?? 1
        };
    };

    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            Promise.all([
                getMyPassports(passportPage - 1, ITEMS_PER_PAGE).catch(() => ({ content: [], page: { totalElements: 0, totalPages: 1 } })),
                getMyRegistrations(reqPage - 1, ITEMS_PER_PAGE).catch(() => ({ content: [], page: { totalElements: 0, totalPages: 1 } }))
            ])
                .then(([passportsRes, reqRes]) => {
                    const isArray = Array.isArray(passportsRes);
                    const passportMeta = extractPageMeta(passportsRes);
                    const requestMeta = extractPageMeta(reqRes);
                    setMyPassports(isArray ? passportsRes : (passportsRes.content || []));
                    setTotalPassports(passportMeta.totalElements);
                    setTotalPassportPages(passportMeta.totalPages);
                    setMyRequests(Array.isArray(reqRes) ? reqRes : (reqRes.content || []));
                    setTotalReqPages(requestMeta.totalPages);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [currentUser, getMyPassports, getMyRegistrations, passportPage, reqPage]);

    if (!currentUser) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '20px' }}><Lock width={40} height={40} stroke="#E53E3E" /></div>
                    <h2 style={{ fontSize: '1.5rem', color: '#102A20', marginBottom: '16px' }}>라운지 입장이 필요합니다.</h2>
                    <button
                        onClick={() => navigate('/login?return=/me/passports')}
                        style={{
                            padding: '14px 28px', fontSize: '1rem', fontWeight: '700', borderRadius: '12px',
                            background: '#1A4D3B', color: 'white', border: 'none', cursor: 'pointer'
                        }}
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#1A4D3B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const pendingServices = []; // Placeholder for real pending services logic

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <div style={{ marginBottom: '12px' }}><FolderOpen width={28} height={28} stroke="#1A4D3B" /></div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#102A20', margin: '0 0 8px 0' }}>디지털 자산 지갑</h2>
                        <p style={{ fontSize: '1rem', color: '#718096', margin: 0 }}>
                            회원님이 소유하신 모든 실물 자산의 디지털 인증서입니다.
                        </p>
                    </div>
                </div>

                {/* Stats Bar */}
                <div style={{
                    display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px'
                }}>
                    {[
                        { label: '보유 자산', value: totalPassports, color: '#1A4D3B', bg: '#F0F9F4' },
                        { label: '진행 중', value: myRequests.filter(r => r.status === 'PENDING').length, color: '#B7791F', bg: '#FFFBEB' },
                        { label: '승인 완료', value: myRequests.filter(r => r.status === 'APPROVED').length, color: '#2F855A', bg: '#F0FFF4' }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: stat.bg, borderRadius: '16px', padding: '20px',
                            textAlign: 'center', border: `1px solid ${stat.color}15`
                        }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: stat.color, marginBottom: '4px' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '600' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
                {pendingServices.length > 0 && (
                    <div
                        onClick={() => navigate(`/service/${pendingServices[0].case_id}`)}
                        style={{
                            background: '#FFFBEB', border: '1px solid #FEF08A', borderRadius: '12px', padding: '16px 20px',
                            cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#B45309', fontWeight: '600'
                        }}
                    >
                        <span>🔔</span> 시스템에 수선 요청 승인 대기 내역이 {pendingServices.length}건 있습니다.
                    </div>
                )}

                {myRequests.length > 0 && (() => {
                    const visibleRequests = myRequests.filter(r => !dismissedIds.includes(r.requestId));
                    if (visibleRequests.length === 0) return null;
                    return (
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4A5568', margin: 0 }}>등록 진행 상태</h3>
                                <span style={{ fontSize: '0.85rem', color: '#A0AEC0' }}>{visibleRequests.length}건</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {visibleRequests.map(req => {
                                    let statusColor = '#E2E8F0';
                                    let textColor = '#4A5568';
                                    let icon = null;
                                    let label = '대기 중';
                                    const canDismiss = req.status !== 'PENDING';
                                    if (req.status === 'PENDING') {
                                        statusColor = '#FEFCBF'; textColor = '#B7791F'; icon = <Clock width={14} height={14} stroke="#B7791F" />; label = '검토 중';
                                    } else if (req.status === 'APPROVED') {
                                        statusColor = '#C6F6D5'; textColor = '#2F855A'; icon = <CheckCircle width={14} height={14} stroke="#2F855A" />; label = '승인 완료';
                                    } else if (req.status === 'REJECTED') {
                                        statusColor = '#FED7D7'; textColor = '#C53030'; icon = <XCircle width={14} height={14} stroke="#C53030" />; label = '반려';
                                    }
                                    return (
                                        <div key={req.requestId} style={{
                                            background: '#FAFCFB', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px 20px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            animation: 'fadeInUp 0.3s ease-out', position: 'relative'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#102A20', marginBottom: '4px' }}>{req.modelName}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#718096' }}>S/N: {req.serialNumber} | 신청일: {req.createdAt?.split('T')[0]}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    background: statusColor, color: textColor, padding: '8px 12px', borderRadius: '8px',
                                                    fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'
                                                }}>
                                                    <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span> {label}
                                                </div>
                                                {canDismiss && (
                                                    <button
                                                        onClick={() => handleDismiss(req.requestId)}
                                                        title="알림 해제"
                                                        style={{
                                                            width: '28px', height: '28px', borderRadius: '8px',
                                                            border: '1px solid #E2E8F0', background: 'white',
                                                            color: '#A0AEC0', fontSize: '0.85rem', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'all 0.2s', flexShrink: 0
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#E53E3E'; e.currentTarget.style.borderColor = '#FEB2B2'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#A0AEC0'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <Pagination currentPage={reqPage} totalPages={totalReqPages} onPageChange={setReqPage} />
                        </div>
                    );
                })()}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', marginTop: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4A5568', margin: 0 }}>보유 여권 목록</h3>
                    <span style={{ fontSize: '0.85rem', color: '#A0AEC0' }}>{totalPassports}건</span>
                </div>
                {(() => {
                    return (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {myPassports.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FAFCFB', borderRadius: '24px', border: '2px dashed #E2E8F0' }}>
                                        <div style={{ marginBottom: '16px', opacity: 0.5 }}><Inbox width={40} height={40} stroke="#A0AEC0" /></div>
                                        <h3 style={{ fontSize: '1.2rem', color: '#4A5568', margin: '0 0 8px 0' }}>보유 제품이 없습니다</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#A0AEC0', marginBottom: '20px' }}>명품의 디지털 여권을 등록해보세요.</p>
                                        <button
                                            onClick={() => navigate('/register')}
                                            style={{
                                                padding: '12px 24px', fontSize: '1rem', fontWeight: '700', borderRadius: '12px',
                                                background: '#2A7258', color: 'white', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.2s'
                                            }}
                                        >
                                            소유권 직접 등록하기
                                        </button>
                                    </div>
                                ) : (
                                    myPassports.map(p => (
                                        <div key={p.passportId} style={{
                                            background: '#FFFFFF', borderRadius: '20px', padding: '24px', display: 'flex',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px',
                                            border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 20px rgba(0,0,0,0.02)', cursor: 'default', transition: 'transform 0.2s'
                                        }} onMouseOver={(e) => !isMobile && (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{
                                                    width: '60px', height: '60px', background: '#F0F9F4', borderRadius: '16px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden'
                                                }}>
                                                    {p.imageUrl ? (
                                                        <img src={p.imageUrl} alt={p.modelName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <Package width={20} height={20} stroke="#1A4D3B" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#102A20', margin: '0 0 4px 0' }}>{p.modelName}</h3>
                                                    <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0 }}>
                                                        S/N: {p.serialNumber} &nbsp;|&nbsp; 취득일: {p.sinceAt?.split('T')[0]}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                                                <button
                                                    onClick={() => {
                                                        const rawCode = p.qrPublicCode || p.qRPublicCode || p.qrpublicCode || p.QR_PUBLIC_CODE;
                                                        const code = rawCode?.toString().trim();
                                                        if (code) navigate(`/p/${code}`);
                                                        else alert("QR 코드를 찾을 수 없습니다.");
                                                    }}
                                                    style={{
                                                        padding: '12px 20px', fontSize: '0.9rem', fontWeight: '600', borderRadius: '10px',
                                                        background: '#F7FAFC', color: '#4A5568', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#EDF2F7'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = '#F7FAFC'}
                                                >
                                                    공개 인증서 보기
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/transfer/start/${p.passportId}`)}
                                                    style={{
                                                        padding: '12px 24px', fontSize: '0.9rem', fontWeight: '700', borderRadius: '10px',
                                                        background: '#1A4D3B', color: '#FFFFFF', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 77, 59, 0.3)'}
                                                    onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                                                >
                                                    양도하기 ➔
                                                </button>
                                            </div>

                                        </div>
                                    ))
                                )}
                            </div>
                            <Pagination currentPage={passportPage} totalPages={totalPassportPages} onPageChange={setPassportPage} />
                        </>
                    );
                })()}
            </div>
        </div>
    );
};

export default Screen5MyPassports;

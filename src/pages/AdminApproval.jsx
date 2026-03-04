import React, { useEffect, useState } from 'react';
import { useDPPStore } from '../store/useDPPStore';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { ShieldCheck, Settings, Inbox, Clock } from '../components/Icons';
import { useIsMobile } from '../hooks/useIsMobile';

const AdminApproval = () => {
    const { listRegistrations, approveRegistration, rejectRegistration, currentUser } = useDPPStore();
    const isMobile = useIsMobile();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [approvedCount, setApprovedCount] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 20;
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ADMIN') {
            setAuthError("슈퍼 관리자(ADMIN) 권한이 필요합니다. 접근이 차단되었습니다.");
            setTimeout(() => navigate('/login?return=/admin/approval'), 4000);
        } else {
            loadRequests();
        }
    }, [currentUser, navigate, page]);

    const loadRequests = async () => {
        try {
            const data = await listRegistrations(page - 1, ITEMS_PER_PAGE);
            const pageData = data || {};
            const items = Array.isArray(pageData) ? pageData : (pageData.content || []);
            const pageInfo = pageData.page || {};

            setRequests(items);
            setTotalPages(Array.isArray(pageData) ? 1 : (pageInfo.totalPages || pageData.totalPages || 1));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (id) => {
        setConfirmModal({
            type: 'APPROVE',
            id,
            title: "민팅 승인 확인",
            message: "검수를 완료하고 정품 민팅(Minting)을 승인하시겠습니까?\n승인 즉시 블록체인 원장이 생성됩니다.",
            icon: '✅',
            confirmText: "네, 승인합니다",
            confirmColor: '#2F855A'
        });
    };

    const handleRejectClick = (id) => {
        setConfirmModal({
            type: 'REJECT',
            id,
            title: "반려 확인",
            message: "위조 의심 또는 증빙 부족으로 본 신청을 반려하시겠습니까?\n신청자는 증빙 자료를 보완하여 다시 재신청해야 합니다.",
            icon: '⚠️',
            confirmText: "네, 반려합니다",
            confirmColor: '#E53E3E'
        });
    };

    const executeAction = async () => {
        if (!confirmModal) return;
        const { type, id } = confirmModal;
        setConfirmModal(null);

        if (type === 'APPROVE') {
            try {
                await approveRegistration(id);
                setRequests(requests.filter(r => r.requestId !== id));
                setApprovedCount(c => c + 1);
                if (requests.length === 1 && page > 1) {
                    setPage(page - 1);
                }
                setSuccessMessage({ title: "민팅 승인 완료", message: "정품 검수가 완료되어 블록체인 소유권 원장에 등재되었습니다." });
            } catch (error) {
                alert('승인 처리 중 시스템 오류: ' + error.message);
            }
        } else if (type === 'REJECT') {
            try {
                await rejectRegistration(id);
                setRequests(requests.filter(r => r.requestId !== id));
                if (requests.length === 1 && page > 1) {
                    setPage(page - 1);
                }
                setSuccessMessage({ title: "반려 처리 완료", message: "신청 반려 처리가 완료되었습니다." });
            } catch (error) {
                alert('거절 처리 중 오류: ' + error.message);
            }
        }
    };

    const renderEvidence = (jsonStr) => {
        try {
            const urls = JSON.parse(jsonStr);
            if (urls && urls.length > 0) {
                return (
                    <div style={{
                        width: 'clamp(80px, 20vw, 120px)', height: 'clamp(80px, 20vw, 120px)',
                        borderRadius: '12px', overflow: 'hidden',
                        border: '2px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer'
                    }} onClick={() => window.open(urls[0], '_blank')}>
                        <img src={urls[0]} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                );
            }
            return <div style={{ padding: '20px', color: '#A0AEC0', fontSize: '0.85rem', border: '1px dashed #CBD5E0', borderRadius: '8px' }}>사진 없음</div>;
        } catch (e) {
            return <div style={{ padding: '20px', color: '#A0AEC0', fontSize: '0.85rem' }}>데이터 오류</div>;
        }
    };

    if (authError) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '50px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
                    <div style={{ marginBottom: '20px' }}><ShieldCheck width={40} height={40} stroke="#E53E3E" /></div>
                    <h2 style={{ fontSize: '1.5rem', color: '#E53E3E', marginBottom: '16px' }}>접근 제한</h2>
                    <p style={{ color: '#718096' }}>{authError}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '900px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)',
                animation: 'fadeInUp 0.4s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ marginBottom: '16px' }}><Settings width={32} height={32} stroke="#1A4D3B" /></div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>중앙 관리자 포털</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: 0 }}>
                        신청된 제품의 증빙 자료를 검토하고 등록을 승인하세요.
                    </p>
                </div>

                {/* Dashboard Stats */}
                {!loading && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '32px'
                    }}>
                        <div style={{
                            background: '#FFFBEB', borderRadius: '16px', padding: '20px',
                            textAlign: 'center', border: '1px solid #B7791F15'
                        }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#B7791F' }}>
                                {requests.length}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '600' }}>대기 중</div>
                        </div>
                        <div style={{
                            background: '#F0FFF4', borderRadius: '16px', padding: '20px',
                            textAlign: 'center', border: '1px solid #2F855A15'
                        }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2F855A' }}>
                                {approvedCount}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '600' }}>처리 완료</div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#1A4D3B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                        <p style={{ fontWeight: '700', color: '#4A5568' }}>데이터 동기화 중...</p>
                    </div>
                ) : (
                    <div>
                        {requests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FAFCFB', borderRadius: '20px', border: '2px dashed #E2E8F0' }}>
                                <div style={{ marginBottom: '16px', opacity: 0.5 }}><Inbox width={40} height={40} stroke="#A0AEC0" /></div>
                                <h3 style={{ fontSize: '1.1rem', color: '#4A5568', margin: 0 }}>대기 중인 신청이 없습니다</h3>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {(() => {
                                    return (<>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#718096', fontWeight: '600' }}>대기 중인 요청: {requests.length}건</span>
                                        </div>
                                        {requests.map(req => (
                                            <div key={req.requestId} style={{
                                                background: '#FAFCFB', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '24px',
                                                display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.2s'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDF2F7', paddingBottom: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ background: '#2B6CB0', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>{req.requestId}</div>
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#102A20', margin: 0 }}>{req.modelName}</h3>
                                                    </div>
                                                    <div style={{ background: '#FEFCBF', color: '#B7791F', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                                                        <Clock width={14} height={14} stroke="#B7791F" style={{ display: 'inline' }} /> {req.status}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px' }}>
                                                    <div style={{ flexShrink: 0 }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#718096', marginBottom: '8px' }}>제출된 증빙 데이터</div>
                                                        {renderEvidence(req.evidenceUrls)}
                                                        <div style={{ fontSize: '0.75rem', color: '#A0AEC0', textAlign: 'center', marginTop: '6px' }}>(클릭하여 원본 보기)</div>
                                                    </div>

                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '120px 1fr', gap: '8px', fontSize: '0.95rem' }}>
                                                            <div style={{ color: '#718096', fontWeight: '600' }}>고유 일련번호</div>
                                                            <div style={{ color: '#102A20', fontWeight: '700', fontFamily: 'monospace', fontSize: '1rem' }}>{req.serialNumber}</div>

                                                            <div style={{ color: '#718096', fontWeight: '600' }}>신청자 ID (소유주)</div>
                                                            <div style={{ color: '#102A20', fontWeight: '500' }}>{req.requesterId}</div>

                                                            <div style={{ color: '#718096', fontWeight: '600' }}>접수 일시</div>
                                                            <div style={{ color: '#102A20', fontWeight: '500' }}>{new Date(req.createdAt).toLocaleString()}</div>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px' }}>
                                                            <button
                                                                onClick={() => handleApproveClick(req.requestId)}
                                                                style={{
                                                                    flex: 2, padding: '14px', fontSize: '1rem', fontWeight: '700', borderRadius: '10px',
                                                                    background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)', color: 'white',
                                                                    border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(26, 77, 59, 0.2)'
                                                                }}
                                                            >
                                                                검증 확인 및 민팅 승인
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectClick(req.requestId)}
                                                                style={{
                                                                    flex: 1, padding: '14px', fontSize: '1rem', fontWeight: '700', borderRadius: '10px',
                                                                    background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FEB2B2', cursor: 'pointer'
                                                                }}
                                                            >
                                                                등록 반려
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                                    </>);
                                })()}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>

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
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                        }}>
                            <ShieldCheck width={32} height={32} stroke="#38A169" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>{successMessage.title}</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.6', marginBottom: '32px' }}>{successMessage.message}</p>
                        <button
                            onClick={() => setSuccessMessage(null)}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#102A20',
                                color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#1A4D3B'}
                            onMouseOut={(e) => e.target.style.background = '#102A20'}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
            {/* Custom Confirmation Modal */}
            {confirmModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(3px)'
                }}>
                    <div style={{
                        background: '#FFF', borderRadius: '20px', padding: '36px', width: '90%', maxWidth: '400px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)', textAlign: 'center', animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <span style={{ fontSize: '28px' }}>{confirmModal.icon}</span>
                        </div>
                        <h3 style={{ margin: '0 0 16px 0', color: '#102A20', fontSize: '1.4rem', fontWeight: '800' }}>{confirmModal.title}</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.6', margin: '0 0 32px 0', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                            {confirmModal.message}
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setConfirmModal(null)}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0',
                                    background: '#F8FAFC', color: '#4A5568', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#EDF2F7'}
                                onMouseOut={(e) => e.target.style.background = '#F8FAFC'}
                            >
                                취소
                            </button>
                            <button
                                onClick={executeAction}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '14px', border: 'none',
                                    background: confirmModal.confirmColor, color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'filter 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.filter = 'brightness(0.9)'}
                                onMouseOut={(e) => e.target.style.filter = 'none'}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApproval;

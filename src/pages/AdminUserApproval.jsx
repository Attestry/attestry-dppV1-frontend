import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { getPendingUsersApi, approveUserApi, rejectUserApi } from '../api';
import Pagination from '../components/Pagination';
import { useIsMobile } from '../hooks/useIsMobile';

const AdminUserApproval = () => {
    const navigate = useNavigate();
    const { currentUser } = useDPPStore();
    const isMobile = useIsMobile();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;
        fetchPending();
    }, [currentUser, page]);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await getPendingUsersApi(page - 1, ITEMS_PER_PAGE);
            const pageData = res.data || {};
            const items = Array.isArray(pageData) ? pageData : (pageData.content || []);
            const pageInfo = pageData.page || {};

            setPendingUsers(items);
            setTotalPages(Array.isArray(pageData) ? 1 : (pageInfo.totalPages || pageData.totalPages || 1));
        } catch (e) {
            console.error('Failed to fetch pending users:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        setActionLoading(userId + action);
        try {
            if (action === 'approve') {
                await approveUserApi(userId);
            } else {
                await rejectUserApi(userId);
            }
            setPendingUsers(prev => prev.filter(u => u.userId !== userId));
            if (pendingUsers.length === 1 && page > 1) {
                setPage(page - 1);
            }
        } catch (e) {
            alert('처리 실패: ' + (e.response?.data?.message || e.message));
        } finally {
            setActionLoading(null);
        }
    };

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', background: '#FFF', padding: '50px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚫</div>
                    <h2 style={{ fontSize: '1.4rem', color: '#102A20', marginBottom: '16px' }}>접근 권한 없음</h2>
                    <p style={{ color: '#718096', marginBottom: '24px' }}>관리자(ADMIN) 전용 페이지입니다.</p>
                    <button onClick={() => navigate('/')} style={{
                        padding: '14px 24px', fontSize: '1rem', fontWeight: '700', borderRadius: '14px',
                        background: '#1A4D3B', color: '#fff', border: 'none', cursor: 'pointer'
                    }}>홈으로</button>
                </div>
            </div>
        );
    }

    const roleLabels = { BRAND: '브랜드 본사', RETAIL: '유통 파트너', PROVIDER: '수선 업체', OWNER: '일반 소비자' };
    const roleColors = { BRAND: '#6B4C9A', RETAIL: '#3182CE', PROVIDER: '#DD6B20', OWNER: '#38A169' };

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>
                    📋 가입 승인 관리
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#718096', margin: 0 }}>
                    브랜드 및 유통 파트너의 가입 신청을 검토하고 승인하거나 거절할 수 있습니다.
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>불러오는 중...</div>
            ) : pendingUsers.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '80px 40px', background: '#FAFCFB', borderRadius: '24px',
                    border: '1px solid #E2E8F0'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                    <h3 style={{ fontSize: '1.3rem', color: '#102A20', marginBottom: '8px' }}>대기 중인 승인 건이 없습니다</h3>
                    <p style={{ color: '#A0AEC0', fontSize: '0.95rem' }}>모든 가입 신청이 처리되었습니다.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingUsers.map(user => (
                        <div key={user.userId} style={{
                            background: '#FFFFFF', borderRadius: '20px', padding: '28px',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)',
                            animation: 'fadeInUp 0.3s ease-out'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700',
                                            background: `${roleColors[user.role]}15`, color: roleColors[user.role]
                                        }}>
                                            {roleLabels[user.role] || user.role}
                                        </span>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                            background: '#FFFAF0', color: '#C05621'
                                        }}>
                                            승인 대기
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#102A20', margin: '0 0 4px 0' }}>
                                        {user.email}
                                    </h3>
                                    <span style={{ fontSize: '0.85rem', color: '#A0AEC0' }}>ID: {user.userId}</span>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px',
                                background: '#FAFCFB', borderRadius: '12px', padding: '16px', marginBottom: '20px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#A0AEC0', marginBottom: '4px' }}>연락처</div>
                                    <div style={{ fontSize: '0.95rem', color: '#102A20', fontWeight: '600' }}>{user.phone || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#A0AEC0', marginBottom: '4px' }}>사업자 등록번호</div>
                                    <div style={{ fontSize: '0.95rem', color: '#102A20', fontWeight: '600' }}>{user.businessNumber || '-'}</div>
                                </div>
                                {user.brandName && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#A0AEC0', marginBottom: '4px' }}>브랜드명</div>
                                        <div style={{ fontSize: '0.95rem', color: '#102A20', fontWeight: '600' }}>{user.brandName}</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleAction(user.userId, 'approve')}
                                    disabled={actionLoading === user.userId + 'approve'}
                                    style={{
                                        flex: 1, padding: '14px', fontSize: '1rem', fontWeight: '700', borderRadius: '12px',
                                        background: actionLoading === user.userId + 'approve' ? '#CBD5E0' : 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                                        color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(26, 77, 59, 0.2)'
                                    }}
                                >
                                    {actionLoading === user.userId + 'approve' ? '처리 중...' : '✅ 승인'}
                                </button>
                                <button
                                    onClick={() => handleAction(user.userId, 'reject')}
                                    disabled={actionLoading === user.userId + 'reject'}
                                    style={{
                                        flex: 1, padding: '14px', fontSize: '1rem', fontWeight: '700', borderRadius: '12px',
                                        background: actionLoading === user.userId + 'reject' ? '#CBD5E0' : '#FFF5F5',
                                        color: '#C53030', border: '1px solid #FEB2B2', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {actionLoading === user.userId + 'reject' ? '처리 중...' : '❌ 거절'}
                                </button>
                            </div>
                        </div>
                    ))}
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            )}
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default AdminUserApproval;

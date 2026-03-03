import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { FileText, Settings as Wrench, Camera } from '../components/Icons';

const Screen9ServiceApproval = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const { getServiceCase, approveService, currentUser } = useDPPStore();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        getServiceCase(caseId)
            .then(res => setData(res))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [caseId, getServiceCase]);

    const handleApprove = async () => {
        if (!currentUser) {
            alert("보안을 위해 라운지 로그인이 필요합니다.");
            return;
        }
        try {
            await approveService(caseId);
            setSuccessMessage({
                title: "서비스 내역 등재 승인 완료",
                message: "정비 및 수선 내역이 제품 생애 주기 이력에 공식 등재되었습니다."
            });
        } catch (e) {
            alert("승인 처리 실패: " + (e.response?.data?.message || e.message));
        }
    };

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#1A4D3B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error || !data) return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '50px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
                <h2 style={{ fontSize: '1.5rem', color: '#102A20', marginBottom: '16px' }}>정보를 불러올 수 없습니다.</h2>
                <p style={{ color: '#718096' }}>{error || '존재하지 않거나 접근 권한이 없는 서비스 케이스입니다.'}</p>
                <button onClick={() => navigate('/me/passports')} style={{ marginTop: '20px', padding: '10px 20px', background: '#1A4D3B', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>돌아가기</button>
            </div>
        </div>
    );

    const asset = data.asset;

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '600px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ marginBottom: '16px' }}><FileText width={32} height={32} stroke="#1A4D3B" /></div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>수선/수리 내역 검토</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: 0 }}>
                        인증 파트너사의 정비 내역을 확인하고 원장 등재를 승인하세요.
                    </p>
                </div>

                <div style={{
                    background: '#FAFCFB', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ marginTop: '4px' }}><Wrench width={28} height={28} stroke="#38A169" /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: '#38A169', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                                CATEGORY: {data.kind}
                            </div>
                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#102A20', marginBottom: '4px' }}>
                                {asset.modelName} 정비 완료
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#718096' }}>접수일: {data.submittedAt.split('T')[0]}</div>
                        </div>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #EDF2F7', marginBottom: '20px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#A0AEC0', marginBottom: '8px' }}>작업 상세 레포트</div>
                        <div style={{ fontSize: '0.95rem', color: '#4A5568', lineHeight: '1.6' }}>
                            파트너사에서 지퍼 슬라이더 정품 교체 및 패브릭 클리닝 공정을 수행했습니다.
                            본 기록은 영구 보존되어 향후 중고 거래 시 귀하 제품의 신뢰도를 폭발적으로 높여줍니다.
                        </div>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #EDF2F7' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#A0AEC0', marginBottom: '8px' }}>제출된 증빙 데이터</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2B6CB0', fontWeight: '600', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}><Camera width={16} height={16} stroke="#2B6CB0" /></span> 정비 후 사진 2장 첨부됨
                        </div>
                    </div>
                </div>

                {data.state === 'COMPLETED' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.4s' }}>
                        <button
                            onClick={handleApprove}
                            style={{
                                width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                                color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 15px rgba(26, 77, 59, 0.2)', transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                        >
                            확인 및 원장 등재 승인
                        </button>
                        <button
                            onClick={() => navigate('/me/passports')}
                            style={{
                                width: '100%', padding: '16px', fontSize: '1rem', fontWeight: '700', borderRadius: '12px',
                                background: '#FFFFFF', color: '#A0AEC0', border: '1px solid #E2E8F0', cursor: 'pointer'
                            }}
                        >
                            나중에 검토하기
                        </button>
                    </div>
                )}

                {data.state === 'APPROVED' && (
                    <div style={{
                        background: '#F0F9F4', border: '1px solid #C6F6D5', padding: '20px', borderRadius: '12px',
                        textAlign: 'center', color: '#2A7258', fontWeight: '700', animation: 'fadeIn 0.4s'
                    }}>
                        이미 원장에 등재된 내역입니다.
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
                            ✅
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>{successMessage.title}</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.6', marginBottom: '32px', whiteSpace: 'pre-wrap' }}>{successMessage.message}</p>
                        <button
                            onClick={() => {
                                setSuccessMessage(null);
                                navigate('/me/passports');
                            }}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#102A20',
                                color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#1A4D3B'}
                            onMouseOut={(e) => e.target.style.background = '#102A20'}
                        >
                            여권 목록으로 이동
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

export default Screen9ServiceApproval;

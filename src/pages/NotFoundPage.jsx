import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '40px 20px'
        }}>
            <div style={{
                textAlign: 'center', maxWidth: '480px',
                animation: 'fadeInUp 0.5s ease-out'
            }}>
                <div style={{
                    fontSize: '6rem', fontWeight: '900', lineHeight: '1',
                    background: 'linear-gradient(135deg, #1A4D3B, #6B4C9A)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '16px',
                    fontFamily: "'Inter', sans-serif"
                }}>
                    404
                </div>
                <h2 style={{
                    fontSize: '1.5rem', fontWeight: '800', color: '#102A20',
                    marginBottom: '12px'
                }}>
                    페이지를 찾을 수 없습니다
                </h2>
                <p style={{
                    fontSize: '1rem', color: '#718096', lineHeight: '1.6',
                    marginBottom: '32px'
                }}>
                    요청하신 페이지가 존재하지 않거나 이동되었습니다.<br />
                    주소를 다시 확인하시거나, 아래 버튼을 눌러 홈으로 이동해 주세요.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '14px 28px', fontSize: '1rem', fontWeight: '700', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                            color: 'white', border: 'none', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(26, 77, 59, 0.2)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                        🏠 홈으로 돌아가기
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '14px 28px', fontSize: '1rem', fontWeight: '600', borderRadius: '12px',
                            background: 'white', color: '#4A5568',
                            border: '1px solid #E2E8F0', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F7FAFC'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                        ← 이전 페이지
                    </button>
                </div>
            </div>
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default NotFoundPage;

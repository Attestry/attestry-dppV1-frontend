import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { ShieldCheck, ScanLine, ArrowsExchange, TrendingUp } from '../components/Icons';
import axios from 'axios';

const HomePage = () => {
    const navigate = useNavigate();
    const { currentUser } = useDPPStore();
    const [stats, setStats] = useState({ assets: 0, transfers: 0, ledger: 0 });

    useEffect(() => {
        axios.get('/api/stats/today').then(res => {
            const data = res.data?.data ?? res.data;
            if (data && typeof data.assets === 'number') setStats(data);
        }).catch(() => { });
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FAFCFB',
            backgroundImage: `
                radial-gradient(circle at 10% 20%, rgba(139, 115, 186, 0.06), transparent 30%),
                radial-gradient(circle at 90% 80%, rgba(20, 60, 48, 0.05), transparent 30%)
            `,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative'
        }}>
            {/* Background blurs */}
            <div style={{
                position: 'fixed', top: '-10%', right: '-5%', width: '40vw', height: '40vw',
                background: 'radial-gradient(circle, rgba(162, 133, 222, 0.08) 0%, transparent 60%)',
                filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed', bottom: '-20%', left: '-15%', width: '50vw', height: '50vw',
                background: 'radial-gradient(circle, rgba(20, 70, 50, 0.06) 0%, transparent 65%)',
                filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none'
            }} />

            <div style={{
                position: 'relative', zIndex: 1, width: '100%', maxWidth: '1000px',
                padding: '40px 24px', display: 'flex', alignItems: 'center', flexDirection: 'column'
            }}>
                {/* Tag */}
                <div style={{
                    display: 'inline-block', padding: '6px 20px',
                    background: '#FFFFFF', border: '1px solid rgba(139, 115, 186, 0.3)',
                    borderRadius: '30px', color: '#6B4C9A', fontSize: '0.85rem', fontWeight: '600',
                    letterSpacing: '0.04em', marginBottom: '24px',
                    boxShadow: '0 4px 15px rgba(139, 115, 186, 0.08)'
                }}>
                    Digital Product Passport
                </div>

                {/* Hero Copy */}
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', fontWeight: '800',
                    letterSpacing: '-0.04em', lineHeight: '1.15', textAlign: 'center',
                    margin: '0 0 20px 0', color: '#102A20'
                }}>
                    당신의 제품에{' '}
                    <span style={{
                        background: 'linear-gradient(135deg, #1A4D3B 0%, #6B4C9A 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>신뢰</span>를 더하다
                </h1>
                <p style={{
                    fontSize: '1.15rem', color: '#64748B', fontWeight: '400', lineHeight: '1.7',
                    maxWidth: '520px', margin: '0 auto 36px', textAlign: 'center'
                }}>
                    내 제품의 모든 이력을 한곳에서 관리하고,<br />
                    안전하게 소유권을 증명하세요.
                </p>

                {/* Hero Image */}
                <div style={{
                    marginBottom: '48px', display: 'flex', justifyContent: 'center'
                }}>
                    <img
                        src="/hero.png"
                        alt="Attestry DPP"
                        style={{
                            width: '280px', height: '280px', objectFit: 'contain',
                            filter: 'drop-shadow(0 20px 40px rgba(26, 77, 59, 0.12))',
                            animation: 'floatHero 4s ease-in-out infinite'
                        }}
                    />
                </div>

                {/* Feature Cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '20px', width: '100%', marginBottom: '48px'
                }}>
                    {[
                        {
                            icon: <ShieldCheck width={26} height={26} stroke="#1A4D3B" />,
                            bg: 'rgba(26, 77, 59, 0.06)', border: 'rgba(26, 77, 59, 0.1)',
                            title: '이력 관리', desc: '제품의 등록, 수리, 양도 내역이 모두 기록되어 언제든 확인할 수 있습니다.'
                        },
                        {
                            icon: <ScanLine width={26} height={26} stroke="#6B4C9A" />,
                            bg: 'rgba(107, 76, 154, 0.06)', border: 'rgba(107, 76, 154, 0.1)',
                            title: '소유권 확인', desc: 'QR 스캔 한 번으로 제품의 등록 정보와 소유 이력을 즉시 확인합니다.'
                        },
                        {
                            icon: <ArrowsExchange width={26} height={26} stroke="#1A4D3B" />,
                            bg: 'rgba(26, 77, 59, 0.06)', border: 'rgba(26, 77, 59, 0.1)',
                            title: '안전한 양도', desc: '중고 거래 시 소유권을 안전하게 이전하고, 거래 이력이 자동으로 남습니다.'
                        },
                        {
                            icon: <TrendingUp width={26} height={26} stroke="#6B4C9A" />,
                            bg: 'rgba(107, 76, 154, 0.06)', border: 'rgba(107, 76, 154, 0.1)',
                            title: '가치 보존', desc: '제품의 품질을 보증하여 중고 시장에서도 변함없는 가치를 인정받습니다.'
                        }
                    ].map((card, i) => (
                        <div key={i} style={{
                            background: '#FFFFFF', border: `1px solid ${card.border}`,
                            borderRadius: '20px', padding: '32px 24px',
                            transition: 'all 0.3s ease', cursor: 'default',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.03)';
                            }}
                        >
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '14px', background: card.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px'
                            }}>
                                {card.icon}
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '10px', color: '#102A20', letterSpacing: '-0.02em' }}>
                                {card.title}
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                                {card.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {currentUser ? (
                        <button
                            onClick={() => navigate('/me/passports')}
                            style={{
                                padding: '16px 40px', fontSize: '1.05rem', fontWeight: '700',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                                color: '#ffffff', border: 'none', cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(26, 77, 59, 0.2)',
                                transition: 'all 0.25s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 28px rgba(26, 77, 59, 0.3)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(26, 77, 59, 0.2)';
                            }}
                        >
                            내 디지털 자산 지갑 보기
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                style={{
                                    padding: '16px 40px', fontSize: '1.05rem', fontWeight: '700',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                                    color: '#ffffff', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(26, 77, 59, 0.2)',
                                    transition: 'all 0.25s ease'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(26, 77, 59, 0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(26, 77, 59, 0.2)';
                                }}
                            >
                                시작하기
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                style={{
                                    padding: '16px 40px', fontSize: '1.05rem', fontWeight: '600',
                                    borderRadius: '14px', background: '#FFFFFF',
                                    color: '#4A5568', border: '1px solid #E2E8F0', cursor: 'pointer',
                                    transition: 'all 0.25s ease'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.borderColor = '#CBD5E0';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                }}
                            >
                                계정 만들기
                            </button>
                        </>
                    )}
                </div>

                {/* ── Stats Counter Section ── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
                    width: '100%', marginTop: '64px', marginBottom: '64px',
                    padding: '36px 0', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}>
                    {[
                        { num: stats.assets.toLocaleString(), label: '등록된 자산', color: '#1A4D3B' },
                        { num: stats.transfers.toLocaleString(), label: '양도 완료', color: '#6B4C9A' },
                        { num: stats.ledger.toLocaleString(), label: '원장 기록', color: '#1A4D3B' }
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: '800',
                                color: s.color, marginBottom: '6px', letterSpacing: '-0.03em'
                            }}>
                                {s.num}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: '500' }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── How It Works (3-Step Flow) ── */}
                <div style={{ width: '100%', marginBottom: '64px' }}>
                    <h2 style={{
                        textAlign: 'center', fontSize: '1.6rem', fontWeight: '800',
                        color: '#102A20', marginBottom: '40px', letterSpacing: '-0.02em'
                    }}>
                        이용 방법
                    </h2>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px', position: 'relative'
                    }}>
                        {[
                            { step: '01', title: '제품 등록', desc: '구매한 제품의 정보와 증빙을 제출합니다.', color: '#1A4D3B' },
                            { step: '02', title: '검증 및 발급', desc: '관리자 확인 후 디지털 여권이 발급됩니다.', color: '#6B4C9A' },
                            { step: '03', title: '관리 및 양도', desc: '이력 기록, 수리 등록, 소유권 양도까지.', color: '#1A4D3B' }
                        ].map((item, i) => (
                            <div key={i} style={{
                                textAlign: 'center', padding: '32px 20px',
                                background: '#FFFFFF', borderRadius: '20px',
                                border: '1px solid rgba(0,0,0,0.05)',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: `${item.color}10`, color: item.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 16px', fontSize: '1.1rem', fontWeight: '800',
                                    border: `2px solid ${item.color}20`
                                }}>
                                    {item.step}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#102A20', marginBottom: '8px' }}>
                                    {item.title}
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Bottom tag */}
                <div style={{
                    marginTop: '4rem', fontSize: '0.8rem', color: '#A0AEC0',
                    letterSpacing: '0.08em', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <span style={{ width: '32px', height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                    POWERED BY ATTESTRY SECURE ENGINE
                    <span style={{ width: '32px', height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                </div>
            </div>

            <style>{`
                @keyframes floatHero {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
            `}</style>
        </div>
    );
};

export default HomePage;

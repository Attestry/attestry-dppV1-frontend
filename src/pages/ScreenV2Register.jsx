import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { Camera } from '../components/Icons';
import axios from 'axios';
import { useIsMobile } from '../hooks/useIsMobile';

const ScreenV2Register = () => {
    const navigate = useNavigate();
    const { currentUser, submitRegistration } = useDPPStore();
    const isMobile = useIsMobile();

    const [modelName, setModelName] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [evidenceBase64, setEvidenceBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEvidenceBase64(reader.result); // Base64 Data URL
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegister = async () => {
        if (!currentUser || currentUser.role !== 'OWNER' || !currentUser.accessToken) {
            alert("개인 소유자(OWNER) 권한으로 로그인 후 이용 가능합니다.");
            navigate('/login?return=/register');
            return;
        }

        const fileInput = document.getElementById('file-upload');
        const file = fileInput?.files[0];

        if (!file) {
            alert("제품 실물 사진 또는 구매 영수증을 반드시 첨부해 주십시오.");
            return;
        }

        setLoading(true);
        try {
            // 1. Get Pre-signed URL
            const { getUploadUrl } = useDPPStore.getState();
            const filename = `evidence_${Date.now()}_${file.name}`;
            const uploadUrl = await getUploadUrl(filename);

            // 2. Upload to Minio
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            });

            // 3. Submit Registration with the file URL/path
            const objectUrl = uploadUrl.split('?')[0];

            await submitRegistration({
                modelName,
                serialNumber,
                evidenceUrls: JSON.stringify([objectUrl]),
                requesterId: currentUser.userId
            });
            setSuccessMessage({
                title: "등록 신청 완료",
                message: "자산 등록 신청이 안전하게 접수되었습니다. 관리자 검토 완료 후 공식 디지털 여권이 발급됩니다."
            });
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || JSON.stringify(err);
            alert(`접수 중 시스템 오류가 발생했습니다: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: isMobile ? '20px 12px' : '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: isMobile ? '28px 20px' : '50px 40px', width: '100%', maxWidth: '600px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)',
                animation: 'fadeInUp 0.4s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 8px 0' }}>소유권 직접 등록</h2>
                            <p style={{ fontSize: '0.95rem', color: '#718096', margin: 0 }}>보유하신 자산의 정보를 입력해주세요.</p>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#FAFCFB', padding: isMobile ? '20px' : '32px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '30px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            제품 모델명
                        </label>
                        <input
                            value={modelName}
                            onChange={e => setModelName(e.target.value)}
                            placeholder="모델명"
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', fontWeight: '600'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            고유 시리얼 번호 (S/N)
                        </label>
                        <input
                            value={serialNumber}
                            onChange={e => setSerialNumber(e.target.value)}
                            placeholder="제품에 각인된 시리얼 번호"
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', fontWeight: '600'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            구매 영수증 번호
                        </label>
                        <input
                            value={receiptNumber}
                            onChange={e => setReceiptNumber(e.target.value)}
                            placeholder="결제 영수증이나 인보이스 번호 (없는 경우 비워둠)"
                            style={{
                                width: '100%', padding: '16px', fontSize: '1rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            실물 구매 증빙 업로드 (필수)
                        </label>
                        <div style={{
                            border: '2px dashed #CBD5E0', padding: '30px 20px', borderRadius: '16px', textAlign: 'center',
                            background: evidenceBase64 ? '#FFFFFF' : '#F7FAFC', transition: 'all 0.2s'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                {evidenceBase64 ? (
                                    <>
                                        <img src={evidenceBase64} alt="Preview" style={{ maxWidth: '100%', maxHeight: isMobile ? '150px' : '200px', borderRadius: '8px', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                                        <span style={{ fontSize: '0.85rem', color: '#4A5568', fontWeight: '600', textDecoration: 'underline', marginTop: '8px' }}>다시 선택하기</span>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#A0AEC0' }}>
                                            ＋
                                        </div>
                                        <div>
                                            <div style={{ color: '#2C5282', fontWeight: '700', fontSize: '1.05rem', marginBottom: '4px' }}>터치하여 사진 첨부</div>
                                            <div style={{ color: '#A0AEC0', fontSize: '0.85rem' }}>영수증 증빙 자료 (최대 10MB)</div>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleRegister}
                    disabled={loading || !evidenceBase64}
                    style={{
                        width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '14px',
                        background: (loading || !evidenceBase64) ? '#CBD5E0' : 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                        color: 'white', border: 'none', cursor: (loading || !evidenceBase64) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s', boxShadow: (loading || !evidenceBase64) ? 'none' : '0 8px 15px rgba(26, 77, 59, 0.2)'
                    }}
                >
                    {loading ? '신원 검증 및 자산화 추진 중...' : '증빙 자료 제출 및 검토 요청'}
                </button>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#A0AEC0', borderTop: '1px dashed #E2E8F0', paddingTop: '20px' }}>
                    * 업로드된 사진은 최고 등급 보안으로 보호되며, 관리자 승인 (Genesis Minting) 후 제품 생애 주기 이력에 완전 등록됩니다.
                </div>
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
                            📝
                        </div>
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
                            onMouseOver={(e) => e.target.style.background = '#1A4D3B'}
                            onMouseOut={(e) => e.target.style.background = '#102A20'}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ScreenV2Register;

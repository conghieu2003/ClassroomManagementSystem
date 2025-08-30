import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Switched to MUI components
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchFormInit, fetchMajors, createUserThunk } from '../../redux/slices/userSlice';
import { Box, Typography, Button, TextField, MenuItem } from '@mui/material';
// Removed Grid to avoid TS overload issues; using Box CSS grid instead
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface CreateUserForm {
  fullName: string;
  email: string;
	phone?: string;
	address?: string;
	avatar?: string;
	gender?: 'male' | 'female' | 'other';
	dateOfBirth?: string;
  role: 'teacher' | 'student';
  teacherCode?: string;
  studentCode?: string;
  title?: string;
	departmentId?: number;
	majorId?: number;
	classCode?: string;
}

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
	const [submitting, setSubmitting] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    	const { previewCode, previewUsername, departments, majors, defaultValues } = useSelector((s: RootState) => s.user);
	const [form, setForm] = useState<CreateUserForm>({
    fullName: '',
    email: '',
		phone: '',
		address: '',
		avatar: '',
		gender: undefined,
		dateOfBirth: '',
    role: 'student',
		classCode: '',
	});

	const handleRoleChange = (role: 'teacher' | 'student'): void => {
		setForm((prev) => ({
			...prev,
			role,
			teacherCode: role === 'teacher' ? prev.teacherCode : '',
			studentCode: role === 'student' ? prev.studentCode : '',
			title: role === 'teacher' ? prev.title : '',
			departmentId: undefined,
			majorId: undefined,
		}));
        
        dispatch(fetchFormInit(role));
	};

    useEffect(() => {
        dispatch(fetchFormInit(form.role));
    }, [dispatch, form.role]);

    // Khi chọn khoa, tự động load danh sách chuyên ngành theo khoa
    useEffect(() => {
        if (form.departmentId) {
            dispatch(fetchMajors({ departmentId: form.departmentId }));
            setForm((p) => ({ ...p, majorId: undefined }));
        } else {
            setForm((p) => ({ ...p, majorId: undefined }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.departmentId]);

	const handleSubmit = async (): Promise<void> => {
		try {
			setSubmitting(true);

			if (!form.fullName || !form.email || !form.role) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(form.email)) {
				toast.error('Email không đúng định dạng');
        return;
      }

			// Validate phone format (optional but if provided should be valid)
			if (form.phone && !/^[0-9+\-\s()]+$/.test(form.phone)) {
				toast.error('Số điện thoại không đúng định dạng');
        return;
      }

			const payload = {
				fullName: form.fullName,
				email: form.email,
				phone: form.phone?.trim() || undefined,
				address: form.address?.trim() || undefined,
				avatar: form.avatar?.trim() || undefined,
				gender: form.gender || undefined,
				dateOfBirth: form.dateOfBirth || undefined,
				role: form.role,
				departmentId: form.departmentId || undefined,
				majorId: form.majorId || undefined,
				classCode: form.classCode?.trim() || undefined,
			};

			const response: any = await (dispatch as any)(createUserThunk(payload));
			if (response?.meta?.requestStatus === 'fulfilled') {
				toast.success('Tạo tài khoản thành công');
        navigate('/users');
      } else {
				toast.error(response?.payload || 'Có lỗi xảy ra khi tạo tài khoản');
      }
    } catch (error: any) {
			toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
			setSubmitting(false);
		}
	};

  return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Box sx={{ p: 3 }}>
				<Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Tạo người dùng</Typography>
				{/* Group: Personal info (top) */}
				<Box sx={{ mb: 3 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Thông tin cá nhân</Typography>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 2 }}>
						<TextField fullWidth required label="Họ và tên" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
						<TextField fullWidth required type="email" label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
						<TextField fullWidth label="Số điện thoại" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
						<TextField fullWidth label="Địa chỉ" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
						<TextField select fullWidth label="Giới tính" value={form.gender || ''} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as any }))}>
							<MenuItem value="male">Nam</MenuItem>
							<MenuItem value="female">Nữ</MenuItem>
							<MenuItem value="other">Khác</MenuItem>
						</TextField>
						<DatePicker label="Ngày sinh" value={form.dateOfBirth ? dayjs(form.dateOfBirth) : null} onChange={(v: Dayjs | null) => setForm((p) => ({ ...p, dateOfBirth: v ? v.format('YYYY-MM-DD') : '' }))} slotProps={{ textField: { fullWidth: true } }} />
					</Box>
				</Box>

				{/* Group: Account & Role (bottom) */}
				<Box>
					<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Thông tin tài khoản & vai trò</Typography>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 2 }}>
						<TextField select fullWidth required label="Vai trò" value={form.role} onChange={(e) => handleRoleChange(e.target.value as any)}>
							<MenuItem value="teacher">Giảng viên</MenuItem>
							<MenuItem value="student">Sinh viên</MenuItem>
						</TextField>
						<TextField fullWidth disabled label={form.role === 'teacher' ? 'Mã giảng viên' : 'Mã sinh viên'} value={previewCode || ''} />
						<TextField fullWidth disabled label="Mật khẩu ban đầu" value={'123456'} />
						<TextField fullWidth disabled label="Username (hiển thị)" value={previewUsername || previewCode || ''} />
						<TextField select fullWidth label={form.role === 'teacher' ? 'Khoa/Bộ môn' : 'Khoa'} value={form.departmentId || ''} onChange={(e) => setForm((p) => ({ ...p, departmentId: Number(e.target.value) }))}>
							{(departments || []).map((d) => (
								<MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
							))}
						</TextField>
						{form.role === 'student' && (
							<TextField select fullWidth label="Chuyên ngành" value={form.majorId || ''} onChange={(e) => setForm((p) => ({ ...p, majorId: Number(e.target.value) }))} disabled={!form.departmentId}>
								{(majors || []).map((m) => (
									<MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
								))}
							</TextField>
						)}
						<TextField fullWidth label="Cơ sở" value={defaultValues.campus || ''} InputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }} />
						<TextField fullWidth label="Hình thức đào tạo" value={defaultValues.trainingType || ''} InputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }} />
						<TextField fullWidth label="Bậc/Trình độ" value={defaultValues.degreeLevel || ''} InputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }} />
						{form.role === 'student' && (
							<TextField fullWidth label="Niên khóa" value={defaultValues.academicYear || ''} InputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }} />
						)}
						{form.role === 'student' && (
							<>
								<TextField fullWidth label="Ngày nhập học" value={defaultValues.enrollmentDate || ''} InputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }} />
								<TextField fullWidth label="Lớp danh nghĩa" value={form.classCode || ''} onChange={(e) => setForm((p) => ({ ...p, classCode: e.target.value }))} />
							</>
						)}
						{form.role === 'teacher' && (
							<>
								<TextField fullWidth label="Ngày vào trường" value={defaultValues.enrollmentDate || ''} InputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }} />
								<TextField fullWidth label="Học hàm/Học vị" value={defaultValues.title || ''} InputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }} />
          </>
        )}
					</Box>
				</Box>

				<Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
					<Button variant="outlined" onClick={() => navigate('/users')}>Hủy</Button>
					<Button variant="contained" onClick={handleSubmit} disabled={submitting}>Tạo tài khoản</Button>
				</Box>
			</Box>
		</LocalizationProvider>
  );
};

export default CreateUser;

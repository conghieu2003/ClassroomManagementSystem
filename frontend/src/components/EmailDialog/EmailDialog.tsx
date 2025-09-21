import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { User } from '../../types';

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSendEmail: (emailData: EmailData) => Promise<void>;
  loading?: boolean;
}

interface EmailData {
  userId: number;
  subject: string;
  content: string;
  includeCredentials: boolean;
}

const EmailDialog: React.FC<EmailDialogProps> = ({
  open,
  onClose,
  user,
  onSendEmail,
  loading = false
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Template email cung cấp thông tin đăng nhập
  const getEmailTemplate = React.useCallback(() => {
    const codeText = user?.role === 'teacher' ? 'giảng viên' : 'sinh viên';
    
    return {
      subject: 'IUH - Thông tin tài khoản và hướng dẫn đăng nhập hệ thống',
      content: `Xin chào ${user?.fullName || ''},

Tài khoản của bạn trên hệ thống quản lý lớp học IUH vừa được khởi tạo thành công.

Thông tin đăng nhập của bạn:
- Mã ${codeText}: [Mã sẽ được hiển thị trong email]
- Mật khẩu: [Mật khẩu sẽ được hiển thị trong email]

Vui lòng đăng nhập và thay đổi mật khẩu ngay để đảm bảo an toàn.

Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với phòng Công Tác Sinh Viên.

Trân trọng,
IUH - Trường Đại học Công nghiệp TP.HCM`
    };
  }, [user?.fullName, user?.role]);

  // Tự động điền thông tin khi dialog mở
  React.useEffect(() => {
    if (open && user) {
      const template = getEmailTemplate();
      setSubject(template.subject);
      setContent(template.content);
    }
  }, [open, user, getEmailTemplate]);

  const handleSend = async () => {
    if (!user) return;

    if (!subject.trim()) {
      setError('Vui lòng nhập tiêu đề email');
      return;
    }

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung email');
      return;
    }

    setError('');

    try {
      await onSendEmail({
        userId: user.id,
        subject: subject.trim(),
        content: content.trim(),
        includeCredentials: true
      });
      
      onClose();
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi email');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'teacher': return 'Giảng viên';
      case 'student': return 'Sinh viên';
      case 'admin': return 'Quản trị viên';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher': return 'primary';
      case 'student': return 'secondary';
      case 'admin': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <EmailIcon />
        Gửi email thông báo
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {user && (
          <Box sx={{ mb: 3 }}>
            {/* Thông tin người nhận */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Thông tin người nhận
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Họ và tên:</Typography>
                  <Typography variant="body1" fontWeight="bold">{user.fullName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Email:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {user.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Vai trò:</Typography>
                  <Chip 
                    label={getRoleText(user.role)} 
                    color={getRoleColor(user.role) as any}
                    size="small"
                    icon={user.role === 'teacher' ? <SchoolIcon /> : <PersonIcon />}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Mã số:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {user.role === 'teacher' ? user.teacherCode : 
                     user.role === 'student' ? user.studentCode : 'ADMIN'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

             {/* Form gửi email */}
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
               <TextField
                 fullWidth
                 label="Tiêu đề email"
                 value={subject}
                 onChange={(e) => setSubject(e.target.value)}
                 variant="outlined"
                 required
               />

               <TextField
                 fullWidth
                 label="Nội dung email"
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 multiline
                 rows={8}
                 variant="outlined"
                 required
                 sx={{
                   '& .MuiInputBase-root': {
                     fontFamily: 'monospace',
                     fontSize: '0.9rem'
                   }
                 }}
               />

               <Alert severity="info">
                 <Typography variant="body2">
                   <strong>Lưu ý:</strong> Email này sẽ tự động bao gồm thông tin đăng nhập:
                   <br />• Mã {user.role === 'teacher' ? 'giảng viên' : 'sinh viên'}
                   <br />• Mật khẩu đăng nhập
                   <br />• Hướng dẫn thay đổi mật khẩu
                 </Typography>
               </Alert>
             </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSend}
          disabled={loading || !subject.trim() || !content.trim()}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              opacity: 0.9
            }
          }}
        >
          {loading ? 'Đang gửi...' : 'Gửi email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailDialog;

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchProfileData, clearError } from '../../redux/slices/profileSlice';


const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profileData, loading, error } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    dispatch(fetchProfileData());
    
    // Clear any previous errors when component mounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);


  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profileData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Không tìm thấy thông tin hồ sơ</Alert>
      </Container>
    );
  }

  const { user, personalProfile, familyInfo, academicProfile, studentInfo, teacherInfo } = profileData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with basic info and avatar */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0D6EFD&color=fff`}
            sx={{ width: 120, height: 120 }}
          />
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {user.fullName}
              </Typography>
              <Chip 
                label={user.role === 'student' ? 'Sinh viên' : user.role === 'teacher' ? 'Giảng viên' : 'Quản trị viên'} 
                color="primary" 
                size="small" 
              />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {user.role === 'student' ? `MSSV: ${studentInfo?.studentCode || user.studentCode}` : 
               user.role === 'teacher' ? `Mã GV: ${teacherInfo?.teacherCode || user.teacherCode}` : 
               'Quản trị viên'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Giới tính: {getGenderText(user.gender)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Academic Information Section - Top */}
      <Box mb={3}>
        <Card elevation={2}>
          <CardContent>
            <Typography 
              variant="h6" 
              component="h2" 
              fontWeight="bold" 
              mb={2}
              sx={{ 
                fontFamily: "'Inter', 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontFeatureSettings: '"liga" 1, "calt" 1'
              }}
            >
              Thông tin học vấn
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
              <Box flex={1}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Box flex={1} mr={2}>
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.role === 'student' ? 'Đang học' : 
                         user.role === 'teacher' ? 'Đang giảng dạy' : 
                         'Đang làm việc'}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        Lớp học:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {academicProfile?.classCode || '-'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Box flex={1} mr={2}>
                      <Typography variant="body2" color="text.secondary">
                        Bậc đào tạo:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {academicProfile?.degreeLevel || '-'}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        Khoa:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {studentInfo?.department?.name || teacherInfo?.department?.name || '-'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Box flex={1} mr={2}>
                      <Typography variant="body2" color="text.secondary">
                        Chuyên ngành:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {studentInfo?.major?.name || teacherInfo?.major?.name || '-'}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        Mã hồ sơ:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.role === 'student' ? studentInfo?.studentCode : 
                         user.role === 'teacher' ? teacherInfo?.teacherCode : 
                         user.username}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
              
              <Box flex={1}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Box flex={1} mr={2}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày vào trường:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(academicProfile?.enrollmentDate)}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        Cơ sở:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {academicProfile?.campus || '-'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Box flex={1} mr={2}>
                      <Typography variant="body2" color="text.secondary">
                        Loại hình đào tạo:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {academicProfile?.trainingType || '-'}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        Ngành:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {studentInfo?.major?.name || teacherInfo?.major?.name || '-'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Khóa học:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {academicProfile?.academicYear || '-'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Personal Information Section */}
        <Box flex={1}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" component="h2" fontWeight="bold" mb={2}>
                Thông tin cá nhân
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Box flex={1} mr={2}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày sinh:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(user.dateOfBirth)}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Số CCCD:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {personalProfile?.idCardNumber || '-'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Box flex={1} mr={2}>
                    <Typography variant="body2" color="text.secondary">
                      Điện thoại:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.phone || '-'}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ liên hệ:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.address || '-'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nơi sinh:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {personalProfile?.placeOfBirth || '-'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Hộ khẩu thường trú:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {personalProfile?.permanentAddress || '-'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tên ngân hàng:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {personalProfile?.bankName || '-'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Box flex={1} mr={2}>
                    <Typography variant="body2" color="text.secondary">
                      Tên chủ tài khoản:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.fullName}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Số tài khoản:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {personalProfile?.bankAccountNumber || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Family Information Section */}
        <Box flex={1}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" component="h2" fontWeight="bold" mb={2}>
                Quan hệ gia đình
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Father's Information */}
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Thông tin cha
              </Typography>
              <Stack spacing={2} mb={3}>
                <Box display="flex" justifyContent="space-between">
                  <Box flex={1} mr={2}>
                    <Typography variant="body2" color="text.secondary">
                      Họ tên Cha:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {familyInfo?.fatherFullName || '-'}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Năm sinh:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {familyInfo?.fatherYearOfBirth || '-'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số điện thoại:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {familyInfo?.fatherPhone || '-'}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Mother's Information */}
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Thông tin mẹ
              </Typography>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Box flex={1} mr={2}>
                    <Typography variant="body2" color="text.secondary">
                      Họ tên Mẹ:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {familyInfo?.motherFullName || '-'}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Năm sinh:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {familyInfo?.motherYearOfBirth || '-'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số điện thoại:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {familyInfo?.motherPhone || '-'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>


    </Container>
  );
};

export default Profile;
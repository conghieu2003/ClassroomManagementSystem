import React, { useState, useEffect } from 'react';
import { DataGrid } from 'devextreme-react/data-grid';
import { LoadPanel } from 'devextreme-react/load-panel';
import { Button } from 'devextreme-react/button';

const SubjectManagement = () => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [{
    dataField: 'code',
    caption: 'Mã môn học',
    width: 120
  }, {
    dataField: 'name',
    caption: 'Tên môn học',
    width: 250
  }, {
    dataField: 'credits',
    caption: 'Số tín chỉ',
    width: 100,
    alignment: 'right'
  }, {
    dataField: 'type',
    caption: 'Loại môn học',
    width: 150,
    lookup: {
      dataSource: [
        { id: 'theory', text: 'Lý thuyết' },
        { id: 'practice', text: 'Thực hành' },
        { id: 'both', text: 'Lý thuyết + Thực hành' }
      ],
      displayExpr: 'text',
      valueExpr: 'id'
    }
  }, {
    dataField: 'startDate',
    caption: 'Ngày bắt đầu',
    dataType: 'date',
    width: 120
  }, {
    dataField: 'endDate',
    caption: 'Ngày kết thúc',
    dataType: 'date',
    width: 120
  }, {
    dataField: 'status',
    caption: 'Trạng thái',
    width: 120,
    cellRender: (cellData) => {
      const color = cellData.value === 'active' ? '#4caf50' : '#f44336';
      return (
        <div style={{
          backgroundColor: color,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {cellData.value === 'active' ? 'Đang mở' : 'Đã đóng'}
        </div>
      );
    }
  }];

  const handleRefresh = () => {
    fetchSubjects();
  };

  return (
    <div style={{ padding: '20px' }}>
      <LoadPanel
        visible={loading}
        showIndicator={true}
        shading={true}
        showPane={true}
        shadingColor="rgba(0,0,0,0.4)"
      />

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button
            icon="refresh"
            onClick={handleRefresh}
            stylingMode="contained"
          />
        </div>
        <Button
          text="Thêm môn học"
          icon="plus"
          type="default"
          stylingMode="contained"
          onClick={() => {/* TODO: Handle add subject */}}
        />
      </div>

      <DataGrid
        dataSource={subjects}
        columns={columns}
        showBorders={true}
        rowAlternationEnabled={true}
        showColumnLines={true}
        showRowLines={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        height="calc(100vh - 200px)"
        paging={{
          pageSize: 10
        }}
        pager={{
          showPageSizeSelector: true,
          allowedPageSizes: [5, 10, 20],
          showInfo: true
        }}
      />
    </div>
  );
};

export default SubjectManagement; 
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// data 디렉토리 생성
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// CSV 파일 경로
const financeCsvPath = path.join(dataDir, 'finance.csv');

// CSV 헤더 초기화
const initializeCsvFile = (filePath, headers) => {
  if (!fs.existsSync(filePath)) {
    const headerRow = headers.join(',') + '\n';
    fs.writeFileSync(filePath, headerRow, 'utf8');
    console.log(`CSV 파일 초기화: ${filePath}`);
  }
};

// finance.csv 초기화
initializeCsvFile(financeCsvPath, ['id', 'date', 'type', 'title', 'amount', 'memo']);

// 재무 데이터 조회 API
app.get('/api/finance', (req, res) => {
  try {
    if (!fs.existsSync(financeCsvPath)) {
      return res.json([]);
    }

    const csvContent = fs.readFileSync(financeCsvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length <= 1) {
      return res.json([]);
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const record = {};
      
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          if (['amount'].includes(header)) {
            record[header] = Number(values[index]) || 0;
          } else {
            record[header] = values[index];
          }
        }
      });
      
      data.push(record);
    }

    res.json(data);
  } catch (error) {
    console.error('재무 데이터 조회 오류:', error);
    res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 재무 데이터 추가 API
app.post('/api/finance', (req, res) => {
  try {
    const { id, date, type, title, amount, memo } = req.body;
    
    if (!id || !date || !type || !title || amount === undefined) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // CSV 라인 생성
    const csvLine = `"${id}","${date}","${type}","${title}","${amount}","${memo || ''}"\n`;
    
    // 파일에 추가
    fs.appendFileSync(financeCsvPath, csvLine, 'utf8');
    
    console.log(`재무 데이터 추가됨: ${id} - ${title}`);
    res.json({ success: true, message: '데이터가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('재무 데이터 추가 오류:', error);
    res.status(500).json({ error: '데이터 저장 중 오류가 발생했습니다.' });
  }
});

// 재무 데이터 수정 API
app.put('/api/finance/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, title, amount, memo } = req.body;
    
    if (!fs.existsSync(financeCsvPath)) {
      return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    }

    const csvContent = fs.readFileSync(financeCsvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length <= 1) {
      return res.status(404).json({ error: '데이터가 없습니다.' });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    let updated = false;
    const updatedLines = [lines[0]]; // 헤더 유지

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const recordId = values[0];
      
      if (recordId === id) {
        // 해당 레코드 업데이트
        const updatedLine = `"${id}","${date}","${type}","${title}","${amount}","${memo || ''}"`;
        updatedLines.push(updatedLine);
        updated = true;
      } else {
        updatedLines.push(lines[i]);
      }
    }

    if (!updated) {
      return res.status(404).json({ error: '해당 ID의 데이터를 찾을 수 없습니다.' });
    }

    // 파일 다시 쓰기
    fs.writeFileSync(financeCsvPath, updatedLines.join('\n') + '\n', 'utf8');
    
    console.log(`재무 데이터 수정됨: ${id}`);
    res.json({ success: true, message: '데이터가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('재무 데이터 수정 오류:', error);
    res.status(500).json({ error: '데이터 수정 중 오류가 발생했습니다.' });
  }
});

// 재무 데이터 삭제 API
app.delete('/api/finance/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!fs.existsSync(financeCsvPath)) {
      return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    }

    const csvContent = fs.readFileSync(financeCsvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length <= 1) {
      return res.status(404).json({ error: '데이터가 없습니다.' });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    let deleted = false;
    const updatedLines = [lines[0]]; // 헤더 유지

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const recordId = values[0];
      
      if (recordId !== id) {
        updatedLines.push(lines[i]);
      } else {
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: '해당 ID의 데이터를 찾을 수 없습니다.' });
    }

    // 파일 다시 쓰기
    fs.writeFileSync(financeCsvPath, updatedLines.join('\n') + '\n', 'utf8');
    
    console.log(`재무 데이터 삭제됨: ${id}`);
    res.json({ success: true, message: '데이터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('재무 데이터 삭제 오류:', error);
    res.status(500).json({ error: '데이터 삭제 중 오류가 발생했습니다.' });
  }
});

// CSV 라인 파싱 함수
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`데이터 디렉토리: ${dataDir}`);
  console.log(`재무 CSV 파일: ${financeCsvPath}`);
});

module.exports = app; 
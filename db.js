const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 생성 또는 연결
const db = new sqlite3.Database(path.join(__dirname, 'timer.db'), (err) => {
    if (err) {
        console.error('데이터베이스 연결 오류:', err);
    } else {
        console.log('데이터베이스 연결 성공');
    }
});

// 테이블 생성 (없으면 생성)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            total_time INTEGER DEFAULT 0
        )
    `);
});

module.exports = db;
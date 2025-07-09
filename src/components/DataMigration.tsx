import React, { useState, useEffect } from 'react';
import { SupabaseMigrator } from '../utils/migrateToSupabase';

const DataMigration: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const status = await SupabaseMigrator.checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('마이그레이션 상태 확인 오류:', error);
    }
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await SupabaseMigrator.migrateAllData();
      setMigrationResult(result);
      
      // 마이그레이션 완료 후 상태 재확인
      await checkMigrationStatus();
    } catch (error) {
      setMigrationResult({ error: error instanceof Error ? error.message : '알 수 없는 오류' });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClearLocalData = () => {
    SupabaseMigrator.clearLocalData();
    checkMigrationStatus();
    setShowConfirm(false);
  };

  const getStatusColor = (hasData: boolean) => {
    return hasData ? 'text-green-600' : 'text-gray-500';
  };

  const getStatusText = (hasData: boolean) => {
    return hasData ? '데이터 있음' : '데이터 없음';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">데이터 마이그레이션</h2>
      
      <div className="space-y-6">
        {/* 마이그레이션 상태 */}
        {migrationStatus && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">데이터 상태</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">로컬 데이터</h4>
                <div className="space-y-1 text-sm">
                  <p className={getStatusColor(migrationStatus.hasLocalData)}>
                    상태: {getStatusText(migrationStatus.hasLocalData)}
                  </p>
                  <p>고객: {migrationStatus.localDataCounts.customers}개</p>
                  <p>상품: {migrationStatus.localDataCounts.products}개</p>
                  <p>예약: {migrationStatus.localDataCounts.appointments}개</p>
                  <p>재무: {migrationStatus.localDataCounts.finance}개</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Supabase 데이터</h4>
                <div className="space-y-1 text-sm">
                  <p className={getStatusColor(migrationStatus.hasSupabaseData)}>
                    상태: {getStatusText(migrationStatus.hasSupabaseData)}
                  </p>
                  <p>고객: {migrationStatus.supabaseDataCounts.customers}개</p>
                  <p>상품: {migrationStatus.supabaseDataCounts.products}개</p>
                  <p>예약: {migrationStatus.supabaseDataCounts.appointments}개</p>
                  <p>재무: {migrationStatus.supabaseDataCounts.finance}개</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 마이그레이션 버튼 */}
        {migrationStatus?.hasLocalData && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">데이터 마이그레이션</h3>
            <p className="text-sm text-gray-600 mb-4">
              로컬 데이터를 Supabase로 마이그레이션합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <button
              onClick={handleMigration}
              disabled={isMigrating}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isMigrating ? '마이그레이션 중...' : '마이그레이션 시작'}
            </button>
          </div>
        )}

        {/* 마이그레이션 결과 */}
        {migrationResult && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">마이그레이션 결과</h3>
            {migrationResult.error ? (
              <div className="text-red-600">
                <p><strong>오류:</strong> {migrationResult.error}</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p><strong>고객:</strong> {migrationResult.customers.count}개 {migrationResult.customers.success ? '성공' : '실패'}</p>
                <p><strong>상품:</strong> {migrationResult.products.count}개 {migrationResult.products.success ? '성공' : '실패'}</p>
                <p><strong>예약:</strong> {migrationResult.appointments.count}개 {migrationResult.appointments.success ? '성공' : '실패'}</p>
                <p><strong>재무:</strong> {migrationResult.finance.count}개 {migrationResult.finance.success ? '성공' : '실패'}</p>
              </div>
            )}
          </div>
        )}

        {/* 로컬 데이터 정리 */}
        {migrationStatus?.hasLocalData && !migrationStatus?.hasSupabaseData && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">로컬 데이터 정리</h3>
            <p className="text-sm text-gray-600 mb-4">
              마이그레이션 후 로컬 데이터를 정리할 수 있습니다.
            </p>
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                로컬 데이터 정리
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600">정말 로컬 데이터를 삭제하시겠습니까?</p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleClearLocalData}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    확인
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 완료 메시지 */}
        {migrationStatus?.hasSupabaseData && !migrationStatus?.hasLocalData && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-green-800">마이그레이션 완료</h3>
            <p className="text-sm text-green-600">
              모든 데이터가 Supabase로 성공적으로 마이그레이션되었습니다.
            </p>
          </div>
        )}

        {/* 새로고침 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={checkMigrationStatus}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            상태 새로고침
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataMigration; 
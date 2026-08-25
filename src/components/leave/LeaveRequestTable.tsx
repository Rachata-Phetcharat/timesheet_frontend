import React, { useState } from 'react'
import { LeaveRequest, LeaveStatus } from '../../types/leave'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { LeaveStatusBadge } from './LeaveStatusBadge'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Modal } from '../ui/modal'
import { formatDate } from '../../lib/utils'
import { Search, Eye, Calendar, User, MessageSquare, Check, X } from 'lucide-react'
import { Input } from '../ui/input'
import { Select } from '../ui/select'

interface LeaveRequestTableProps {
  requests: LeaveRequest[]
  isLoading?: boolean
  isAdmin?: boolean
  onUpdateStatus?: (id: string, status: LeaveStatus, comment?: string) => Promise<void>
}

export const LeaveRequestTable: React.FC<LeaveRequestTableProps> = ({
  requests,
  isLoading,
  isAdmin = false,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [approverComment, setApproverComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'personal':
        return <Badge variant="purple">ลากิจ</Badge>
      case 'sick':
        return <Badge variant="info">ลาป่วย</Badge>
      case 'vacation':
        return <Badge variant="secondary">ลาพักร้อน</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter
    const matchesSearch =
      searchTerm === '' ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.employeeName && req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const handleStatusChange = async (status: LeaveStatus) => {
    if (!selectedRequest || !onUpdateStatus) return
    setActionLoading(true)
    try {
      await onUpdateStatus(selectedRequest.id, status, approverComment)
      setSelectedRequest(null)
      setApproverComment('')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ค้นหาเหตุผล, ชื่อพนักงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'ทุกสถานะ', value: 'all' },
              { label: 'รออนุมัติ', value: 'pending' },
              { label: 'อนุมัติแล้ว', value: 'approved' },
              { label: 'ไม่อนุมัติ', value: 'rejected' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>พนักงาน</TableHead>}
              <TableHead>ประเภทการลา</TableHead>
              <TableHead>ช่วงวันที่ลา</TableHead>
              <TableHead>เหตุผล</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="h-14">
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-8 w-8 text-slate-300" />
                    <span>ไม่พบรายการคำขอลา</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req) => (
                <TableRow key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  {isAdmin && (
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                          {req.employeeName ? req.employeeName.charAt(0) : 'E'}
                        </div>
                        <span>{req.employeeName || req.employeeId}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>{getLeaveTypeBadge(req.type)}</TableCell>
                  <TableCell className="text-slate-700 font-medium">
                    {formatDate(req.startDate)} - {formatDate(req.endDate)}
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-xs truncate">
                    {req.reason}
                  </TableCell>
                  <TableCell>
                    <LeaveStatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-slate-600 hover:text-indigo-600"
                      onClick={() => {
                        setSelectedRequest(req)
                        setApproverComment(req.approverComment || '')
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      <span>{isAdmin && req.status === 'pending' ? 'พิจารณา' : 'ดูรายละเอียด'}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details & Approval Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="รายละเอียดคำขออนุมัติการลา"
        description={selectedRequest ? `รหัสคำขอ: ${selectedRequest.id}` : ''}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 space-y-3 text-sm">
              {selectedRequest.employeeName && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-400" />
                    ผู้ยื่นคำขอ
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedRequest.employeeName} ({selectedRequest.employeeId})
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-500">ประเภทการลา:</span>
                <div>{getLeaveTypeBadge(selectedRequest.type)}</div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">ช่วงวันที่ลา:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedRequest.startDate)} ถึง {formatDate(selectedRequest.endDate)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">สถานะปัจจุบัน:</span>
                <LeaveStatusBadge status={selectedRequest.status} />
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 block mb-1">เหตุผลการลา:</span>
                <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200/80">
                  {selectedRequest.reason}
                </p>
              </div>

              {selectedRequest.approverComment && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 block mb-1">ความเห็นจากผู้อนุมัติ:</span>
                  <p className="text-slate-700 bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 text-xs">
                    {selectedRequest.approverComment} ({selectedRequest.approverName || 'HR'})
                  </p>
                </div>
              )}
            </div>

            {isAdmin && selectedRequest.status === 'pending' && (
              <div className="space-y-3 pt-2">
                <Input
                  label="ข้อความประกอบการพิจารณา / หมายเหตุ"
                  placeholder="เช่น อนุมัติเรียบร้อย, กรุณาแนบใบรับรองแพทย์..."
                  value={approverComment}
                  onChange={(e) => setApproverComment(e.target.value)}
                />
                <div className="flex justify-end gap-2.5">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleStatusChange('rejected')}
                    isLoading={actionLoading}
                  >
                    <X className="h-4 w-4" />
                    ไม่อนุมัติ (Reject)
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleStatusChange('approved')}
                    isLoading={actionLoading}
                  >
                    <Check className="h-4 w-4" />
                    อนุมัติคำขอ (Approve)
                  </Button>
                </div>
              </div>
            )}

            {(!isAdmin || selectedRequest.status !== 'pending') && (
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  ปิดหน้าต่าง
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

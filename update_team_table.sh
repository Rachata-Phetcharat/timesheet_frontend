#!/bin/bash
file="src/pages/TeamAttendancePage.tsx"
awk '
/const \[statusFilter, setStatusFilter\] = useState<string>\('\''all'\''\)/ {
  print $0
  print "  const [currentPage, setCurrentPage] = useState(1)"
  print "  const itemsPerPage = 10"
  next
}
/const filteredTeamRecords = teamRecords\.filter\(/ {
  print $0
  next
}
/return matchesSearch && matchesStatus/ {
  print $0
  next
}
/}\)/ {
  if (seen_filter) {
    print $0
    next
  }
  print $0
  if ($0 == "  })") {
    seen_filter = 1
    print "  const totalPages = Math.ceil(filteredTeamRecords.length / itemsPerPage)"
    print "  React.useEffect(() => {"
    print "    setCurrentPage(1)"
    print "  }, [searchTerm, statusFilter, selectedMonth, selectedDepartment])"
    print "  const paginatedRecords = filteredTeamRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)"
  }
  next
}
/filteredTeamRecords\.length === 0/ {
  sub(/filteredTeamRecords\.length === 0/, "paginatedRecords.length === 0")
  print $0
  next
}
/filteredTeamRecords\.map\(/ {
  sub(/filteredTeamRecords\.map/, "paginatedRecords.map")
  print $0
  next
}
/<\/Table>/ {
  print $0
  print "          </div>"
  print "          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />"
  next
}
/import \{ Pagination \} from/ {
  next
}
/import \{ Table,/ {
  print "import { Pagination } from '\''../components/ui/pagination'\''"
  print $0
  next
}
/          <\/div>/ {
  if (in_table_wrapper) {
    in_table_wrapper = 0
    next
  }
  print $0
  next
}
/<div className="rounded-2xl border border-slate-200\/80 overflow-hidden shadow-sm">/ {
  in_table_wrapper = 1
  print $0
  next
}
{ print $0 }
' "$file" > tmp_file && mv tmp_file "$file"

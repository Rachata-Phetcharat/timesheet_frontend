#!/bin/bash
file="src/components/attendance/AttendanceTable.tsx"
awk '
/const \[statusFilter, setStatusFilter\] = useState<string>\('\''all'\''\)/ {
  print $0
  print "  const [currentPage, setCurrentPage] = useState(1)"
  print "  const itemsPerPage = 10"
  next
}
/const filteredRecords = records\.filter\(/ {
  print $0
  next
}
/return matchesStatus && matchesSearch/ {
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
    print "  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)"
    print "  React.useEffect(() => {"
    print "    setCurrentPage(1)"
    print "  }, [searchTerm, statusFilter, selectedMonth])"
    print "  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)"
  }
  next
}
/filteredRecords\.length === 0/ {
  sub(/filteredRecords\.length === 0/, "paginatedRecords.length === 0")
  print $0
  next
}
/filteredRecords\.map\(/ {
  sub(/filteredRecords\.map/, "paginatedRecords.map")
  print $0
  next
}
/<\/Table>/ {
  print $0
  print "      </div>"
  print "      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />"
  next
}
/import \{ Pagination \} from/ {
  next
}
/import \{ Table,/ {
  print "import { Pagination } from '\''../ui/pagination'\''"
  print $0
  next
}
/      <\/div>/ {
  if (in_table_wrapper) {
    in_table_wrapper = 0
    next
  }
  print $0
  next
}
/<div className="rounded-2xl border border-slate-200\/80 bg-white overflow-hidden shadow-sm">/ {
  in_table_wrapper = 1
  print $0
  next
}
{ print $0 }
' "$file" > tmp_file && mv tmp_file "$file"

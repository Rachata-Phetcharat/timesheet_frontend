#!/bin/bash
file="src/api/attendance.ts"
awk '
/date: r\.clock_in_at \? r\.clock_in_at\.slice\(0, 10\) : undefined/ {
  print "      date: r.clock_in_at ? new Date(r.clock_in_at).toLocaleDateString('\''en-CA'\'') : undefined"
  next
}
/const todayStr = new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/ {
  print "    const todayStr = new Date().toLocaleDateString('\''en-CA'\'')"
  next
}
{ print $0 }
' "$file" > tmp_file && mv tmp_file "$file"

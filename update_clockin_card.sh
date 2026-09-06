#!/bin/bash
file="src/components/attendance/ClockInOutCard.tsx"
awk '
/const \[successMessage, setSuccessMessage\] = useState/ {
  print $0
  print "  const [errorMessage, setErrorMessage] = useState('\'''\'')"
  next
}
/catch \(err\)/ {
  print "    } catch (err: any) {"
  print "      console.error('\''Clock action failed:'\'', err)"
  print "      const msg = err.response?.data?.detail || '\''เกิดข้อผิดพลาดในการบันทึกเวลา'\''"
  print "      setErrorMessage(msg)"
  print "      setTimeout(() => setErrorMessage('\'''\''), 5000)"
  print "    }"
  in_catch = 1
  next
}
/console\.error/ {
  if (in_catch) next
}
/\} catch \(err\) \{/ {
  if (in_catch) next
}
/    \}/ {
  if (in_catch) {
    in_catch = 0
    next
  }
}
/\{\/\* Alert Success \*\/\}/ {
  print "          {/* Alert Error */}"
  print "          {errorMessage && ("
  print "            <div className=\"flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-800 animate-fade-in\">"
  print "              <AlertTriangle className=\"h-5 w-5 text-rose-600 flex-shrink-0\" />"
  print "              <span className=\"font-medium\">{errorMessage}</span>"
  print "            </div>"
  print "          )}"
  print ""
  print $0
  next
}
{ print $0 }
' "$file" > tmp_file && mv tmp_file "$file"

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useExamResults, useDeleteExamResult, getExamFileUrl } from '@/hooks/useSaude'
import { SwipeableRow } from '@/components/ui/SwipeableRow'

export function ExamList() {
  const { data: exams = [] } = useExamResults()
  const deleteExam = useDeleteExamResult()

  async function openFile(filePath: string) {
    const url = await getExamFileUrl(filePath)
    if (url) window.open(url, '_blank')
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <i className="ti ti-file-text text-[#3a3a50]" style={{ fontSize: 28 }} />
        <p className="text-[#3a3a50] text-sm">Nenhum exame registrado ainda</p>
      </div>
    )
  }

  return (
    <div>
      {exams.map(exam => (
        <SwipeableRow key={exam.id}
          actions={[
            {
              icon: 'ti-trash',
              color: 'var(--swipe-delete-color)',
              bg: 'var(--swipe-delete-bg)',
              onPress: () => deleteExam.mutate(exam),
            },
          ]}
        >
          <button
            onClick={() => exam.file_path && openFile(exam.file_path)}
            className="flex items-center gap-3 py-3 border-b border-[#13131f] bg-[#0a0a0f] w-full text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-[#13131f] border border-[#1e1e32] flex items-center justify-center flex-shrink-0">
              <i
                className={`ti ${exam.file_type === 'pdf' ? 'ti-file-type-pdf' : 'ti-photo'} text-[#6366f1]`}
                style={{ fontSize: 16 }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#e2e2f0] truncate">{exam.title}</p>
              <p className="text-[11px] text-[#6b6b80] mt-0.5">
                {format(parseISO(exam.date), "d 'de' MMM yyyy", { locale: ptBR })}
              </p>
              {exam.notes && (
                <p className="text-[11px] text-[#6b6b80] mt-0.5 truncate italic">"{exam.notes}"</p>
              )}
            </div>
            {exam.file_path && (
              <i className="ti ti-external-link text-[#3a3a50] flex-shrink-0" style={{ fontSize: 14 }} />
            )}
          </button>
        </SwipeableRow>
      ))}
    </div>
  )
}

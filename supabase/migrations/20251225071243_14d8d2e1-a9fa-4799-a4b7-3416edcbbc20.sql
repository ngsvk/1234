-- Create timetable_entries for shared student/staff timetable
CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name text NOT NULL,
  class text NOT NULL,
  section text NOT NULL,
  day_of_week text NOT NULL,
  subject text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  room text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timetable entries are viewable by everyone"
ON public.timetable_entries
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage timetable entries"
ON public.timetable_entries
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER timetable_entries_set_updated_at
BEFORE UPDATE ON public.timetable_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Attendance summaries per class/teacher
CREATE TABLE IF NOT EXISTS public.attendance_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name text NOT NULL,
  class text NOT NULL,
  section text NOT NULL,
  date date NOT NULL,
  present_count integer NOT NULL,
  total_count integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.attendance_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance summaries are viewable by everyone"
ON public.attendance_summaries
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage attendance summaries"
ON public.attendance_summaries
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER attendance_summaries_set_updated_at
BEFORE UPDATE ON public.attendance_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Exam schedule per class/teacher
CREATE TABLE IF NOT EXISTS public.exam_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name text NOT NULL,
  class text NOT NULL,
  section text NOT NULL,
  exam_name text NOT NULL,
  exam_date date NOT NULL,
  exam_time text NOT NULL,
  room text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exam schedule is viewable by everyone"
ON public.exam_schedule
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage exam schedule"
ON public.exam_schedule
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER exam_schedule_set_updated_at
BEFORE UPDATE ON public.exam_schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Rating summaries per class/teacher
CREATE TABLE IF NOT EXISTS public.rating_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name text NOT NULL,
  class text NOT NULL,
  section text NOT NULL,
  average_rating numeric NOT NULL,
  feedback_count integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rating_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rating summaries are viewable by everyone"
ON public.rating_summaries
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage rating summaries"
ON public.rating_summaries
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER rating_summaries_set_updated_at
BEFORE UPDATE ON public.rating_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
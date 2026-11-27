-- ============================================================================
-- Migration 02: Views, Triggers & Partial Unique Indexes (Sỹ - Database)
-- ============================================================================

-- 1. View: v_book_availability
-- Thống kê tồn kho bản sao cho mỗi đầu sách chưa bị soft-delete (is_deleted = false)
CREATE OR REPLACE VIEW v_book_availability AS
SELECT
  b.book_id,
  b.isbn,
  b.title,
  b.publisher,
  b.publish_year,
  b.language,
  COUNT(c.copy_id) FILTER (WHERE c.is_deleted = FALSE) AS total_copies,
  COUNT(c.copy_id) FILTER (
    WHERE c.is_deleted = FALSE
      AND c.availability_status = 'AVAILABLE'
      AND c.condition_status = 'GOOD'
  ) AS available_copies,
  COUNT(c.copy_id) FILTER (
    WHERE c.is_deleted = FALSE
      AND c.availability_status = 'BORROWED'
  ) AS borrowed_copies,
  COUNT(c.copy_id) FILTER (
    WHERE c.is_deleted = FALSE
      AND c.availability_status = 'RESERVED'
  ) AS reserved_copies,
  COUNT(c.copy_id) FILTER (
    WHERE c.is_deleted = FALSE
      AND c.condition_status IN ('DAMAGED', 'LOST')
  ) AS damaged_or_lost_copies
FROM books b
LEFT JOIN book_copies c ON c.book_id = b.book_id
WHERE b.is_deleted = FALSE
GROUP BY b.book_id, b.isbn, b.title, b.publisher, b.publish_year, b.language;

-- 2. View: v_overdue_details
-- Danh sách chi tiết các cuốn đang mượn quá hạn (chưa trả & due_date < NOW())
CREATE OR REPLACE VIEW v_overdue_details AS
SELECT
  bd.borrow_detail_id,
  bd.borrow_record_id,
  br.borrow_date,
  bd.due_date,
  bd.renewal_count,
  u.user_id AS borrower_id,
  u.full_name AS borrower_name,
  u.email AS borrower_email,
  u.phone AS borrower_phone,
  u.role AS borrower_role,
  c.copy_id,
  c.barcode,
  b.book_id,
  b.isbn,
  b.title AS book_title,
  GREATEST(1, FLOOR(EXTRACT(EPOCH FROM (NOW() - bd.due_date)) / 86400)::INT) AS overdue_days,
  (
    GREATEST(1, FLOOR(EXTRACT(EPOCH FROM (NOW() - bd.due_date)) / 86400)::INT)
    * COALESCE(
        (SELECT NULLIF(ls.value, '')::NUMERIC FROM library_settings ls WHERE ls.key = 'FINE_PER_DAY'),
        5000
      )
  )::NUMERIC(10, 2) AS estimated_fine
FROM borrow_details bd
JOIN borrow_records br ON br.borrow_record_id = bd.borrow_record_id
JOIN users u ON u.user_id = br.borrower_id
JOIN book_copies c ON c.copy_id = bd.copy_id
JOIN books b ON b.book_id = c.book_id
WHERE bd.return_date IS NULL
  AND bd.status IN ('BORROWED', 'OVERDUE')
  AND bd.due_date < NOW();

-- 3. Trigger Function: Kiểm tra người lập phiếu mượn phải có role LIBRARIAN hoặc MANAGER đang ACTIVE
CREATE OR REPLACE FUNCTION fn_check_borrow_librarian_role()
RETURNS TRIGGER AS $$
DECLARE
  v_role "Role";
  v_status "UserStatus";
BEGIN
  SELECT role, status INTO v_role, v_status
  FROM users
  WHERE user_id = NEW.librarian_id;

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Librarian user % does not exist', NEW.librarian_id;
  END IF;

  IF v_role NOT IN ('LIBRARIAN', 'MANAGER') THEN
    RAISE EXCEPTION 'User % with role % is not permitted to issue borrow records (requires LIBRARIAN or MANAGER)',
      NEW.librarian_id, v_role;
  END IF;

  IF v_status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'Librarian user % is not ACTIVE', NEW.librarian_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_borrow_librarian_role ON borrow_records;
CREATE TRIGGER trg_check_borrow_librarian_role
BEFORE INSERT OR UPDATE OF librarian_id ON borrow_records
FOR EACH ROW
EXECUTE FUNCTION fn_check_borrow_librarian_role();

-- 4. Trigger Function: Đồng bộ cột is_active theo status trên bảng users (tương thích auth cũ và mới)
CREATE OR REPLACE FUNCTION fn_sync_user_is_active()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'LOCKED' THEN
      NEW.is_active := FALSE;
    ELSIF NEW.is_active = FALSE THEN
      NEW.status := 'LOCKED';
    ELSE
      NEW.status := 'ACTIVE';
      NEW.is_active := TRUE;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      NEW.is_active := (NEW.status = 'ACTIVE');
    ELSIF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      NEW.status := CASE WHEN NEW.is_active THEN 'ACTIVE'::"UserStatus" ELSE 'LOCKED'::"UserStatus" END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_user_is_active ON users;
CREATE TRIGGER trg_sync_user_is_active
BEFORE INSERT OR UPDATE OF status, is_active ON users
FOR EACH ROW
EXECUTE FUNCTION fn_sync_user_is_active();

-- 5. Partial Unique Indexes bảo toàn toàn vẹn dữ liệu ở tầng DB
-- Một cuốn sách vật lý không thể xuất hiện trong 2 phiếu mượn chưa trả cùng lúc
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_borrow_per_copy
  ON borrow_details (copy_id)
  WHERE return_date IS NULL;

-- Một người dùng không thể đặt trước trùng cùng một đầu sách khi đang có lượt PENDING hoặc READY
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_user_book
  ON reservations (user_id, book_id)
  WHERE status IN ('PENDING', 'READY');

-- Một bản sao vật lý chỉ có thể được giữ (READY) cho tối đa 1 lượt đặt trước tại một thời điểm
CREATE UNIQUE INDEX IF NOT EXISTS ux_active_reservation_copy
  ON reservations (copy_id)
  WHERE status = 'READY' AND copy_id IS NOT NULL;

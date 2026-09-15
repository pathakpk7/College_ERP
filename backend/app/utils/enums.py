import enum


class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    ADMIN = "ADMIN"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    EXCUSED = "EXCUSED"


class NocStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class AssessmentType(str, enum.Enum):
    SESSIONAL_1 = "SESSIONAL_1"
    SESSIONAL_2 = "SESSIONAL_2"
    MARKUP_1 = "MARKUP_1"
    MARKUP_2 = "MARKUP_2"


class FeeStatus(str, enum.Enum):
    PAID = "PAID"
    PARTIAL = "PARTIAL"
    PENDING = "PENDING"
    OVERDUE = "OVERDUE"


class LibraryStatus(str, enum.Enum):
    ISSUED = "ISSUED"
    RETURNED = "RETURNED"
    OVERDUE = "OVERDUE"


class GrievanceStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class MaterialType(str, enum.Enum):
    NOTE = "NOTE"
    ASSIGNMENT = "ASSIGNMENT"
    PYQ = "PYQ"
    REFERENCE_LINK = "REFERENCE_LINK"
    CONTEST_PREP = "CONTEST_PREP"
    ANNOUNCEMENT = "ANNOUNCEMENT"


class BookCategory(str, enum.Enum):
    ENGINEERING = "ENGINEERING"
    COMPUTER_SCIENCE = "COMPUTER_SCIENCE"
    ELECTRONICS = "ELECTRONICS"
    MATHEMATICS = "MATHEMATICS"
    LITERATURE = "LITERATURE"
    COMPETITIVE_EXAM = "COMPETITIVE_EXAM"


class BookOrderType(str, enum.Enum):
    BORROW = "BORROW"
    BUY = "BUY"


class BookOrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    DELIVERED = "DELIVERED"
    RETURNED = "RETURNED"
    CANCELLED = "CANCELLED"


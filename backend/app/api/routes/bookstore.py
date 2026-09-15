from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.db.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user, require_role
from app.models.all_models import User, Student, StoreBook, StoreOrder
from app.schemas.erp_schemas import (
    StoreBookResponse, StoreBookCreateRequest,
    StoreOrderRequest, StoreOrderResponse
)
from app.utils.enums import BookCategory, BookOrderType, BookOrderStatus, UserRole

router = APIRouter()

# Initial seed data inspired by Literary Haven and College Engineering Curriculum in Indian Rupees (₹)
INITIAL_BOOKS = [
    {
        "title": "Data Structure Using C and C++",
        "author": "Reema Thareja",
        "category": BookCategory.COMPUTER_SCIENCE,
        "price": 450.0,
        "borrow_fee": 50.0,
        "rating": 4.8,
        "publisher": "Oxford University Press",
        "edition": "3rd Edition",
        "cover_image": "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=400&q=80",
        "description": "Comprehensive guide covering arrays, linked lists, trees, graphs, and algorithms with implementation in C/C++.",
        "stock_quantity": 15,
        "is_available": True,
        "expected_restock_date": None
    },
    {
        "title": "Digital Electronics & Logic Design",
        "author": "M. Morris Mano",
        "category": BookCategory.ELECTRONICS,
        "price": 520.0,
        "borrow_fee": 50.0,
        "rating": 4.6,
        "publisher": "Pearson Education",
        "edition": "5th Edition",
        "cover_image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
        "description": "Standard textbook for digital logic, boolean algebra, combinational circuits, and sequential counters.",
        "stock_quantity": 12,
        "is_available": True,
        "expected_restock_date": None
    },
    {
        "title": "Discrete Mathematics and Its Applications",
        "author": "Kenneth H. Rosen",
        "category": BookCategory.MATHEMATICS,
        "price": 680.0,
        "borrow_fee": 60.0,
        "rating": 4.9,
        "publisher": "McGraw-Hill",
        "edition": "8th Edition",
        "cover_image": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80",
        "description": "Foundational text on mathematical reasoning, combinatorial analysis, discrete structures, and graph theory.",
        "stock_quantity": 20,
        "is_available": True,
        "expected_restock_date": None
    },
    {
        "title": "Introduction to Algorithms (CLRS)",
        "author": "Thomas H. Cormen, Charles E. Leiserson",
        "category": BookCategory.COMPUTER_SCIENCE,
        "price": 1250.0,
        "borrow_fee": 100.0,
        "rating": 4.9,
        "publisher": "MIT Press",
        "edition": "4th Edition",
        "cover_image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
        "description": "The definitive modern handbook on algorithm design, dynamic programming, greedy methods, and complexity.",
        "stock_quantity": 8,
        "is_available": True,
        "expected_restock_date": None
    },
    {
        "title": "Operating System Concepts",
        "author": "Abraham Silberschatz, Peter B. Galvin",
        "category": BookCategory.COMPUTER_SCIENCE,
        "price": 890.0,
        "borrow_fee": 70.0,
        "rating": 4.8,
        "publisher": "Wiley",
        "edition": "10th Edition",
        "cover_image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80",
        "description": "In-depth treatment of processes, threads, synchronization, memory management, and virtualization.",
        "stock_quantity": 0,
        "is_available": False,
        "expected_restock_date": date.today() + timedelta(days=6)  # Restocking in 6 days
    },
    {
        "title": "Cracking the Coding Interview",
        "author": "Gayle Laakmann McDowell",
        "category": BookCategory.COMPETITIVE_EXAM,
        "price": 750.0,
        "borrow_fee": 60.0,
        "rating": 4.9,
        "publisher": "CareerCup",
        "edition": "6th Edition",
        "cover_image": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80",
        "description": "189 programming questions and solutions covering big O notation, data structures, algorithms, and behavioral interviews.",
        "stock_quantity": 25,
        "is_available": True,
        "expected_restock_date": None
    },
    {
        "title": "Higher Engineering Mathematics",
        "author": "B. S. Grewal",
        "category": BookCategory.MATHEMATICS,
        "price": 650.0,
        "borrow_fee": 50.0,
        "rating": 4.7,
        "publisher": "Khanna Publishers",
        "edition": "44th Edition",
        "cover_image": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80",
        "description": "Comprehensive engineering mathematics resource covering calculus, differential equations, and numerical techniques.",
        "stock_quantity": 18,
        "is_available": True,
        "expected_restock_date": None
    },
    {
        "title": "Adventure Awaits (Haven Classics)",
        "author": "John Adventure",
        "category": BookCategory.LITERATURE,
        "price": 380.0,
        "borrow_fee": 40.0,
        "rating": 4.9,
        "publisher": "Literary Haven Press",
        "edition": "Special Edition",
        "cover_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
        "description": "An exhilarating journey through uncharted landscapes and timeless discovery.",
        "stock_quantity": 14,
        "is_available": True,
        "expected_restock_date": None
    },
    {
        "title": "Mystery of Time",
        "author": "Sarah Mystery",
        "category": BookCategory.LITERATURE,
        "price": 340.0,
        "borrow_fee": 40.0,
        "rating": 4.7,
        "publisher": "Chronicle Books",
        "edition": "1st Edition",
        "cover_image": "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80",
        "description": "A thrilling tale of temporal anomalies and mysterious chronicles across generations.",
        "stock_quantity": 0,
        "is_available": False,
        "expected_restock_date": date.today() + timedelta(days=4)  # Restocking in 4 days
    },
    {
        "title": "Love & Poetry: Anthologies",
        "author": "Emma Poet",
        "category": BookCategory.LITERATURE,
        "price": 290.0,
        "borrow_fee": 30.0,
        "rating": 5.0,
        "publisher": "Haven Classics",
        "edition": "Deluxe Illustrated",
        "cover_image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
        "description": "A classic collection of soul-stirring sonnets and verses from the literary renaissance.",
        "stock_quantity": 15,
        "is_available": True,
        "expected_restock_date": None
    }
]


def seed_books_if_empty(db: Session):
    if db.query(StoreBook).count() == 0:
        for b_data in INITIAL_BOOKS:
            book = StoreBook(**b_data)
            db.add(book)
        db.commit()


@router.get("/books", response_model=List[StoreBookResponse])
def get_books(
    category: Optional[BookCategory] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by title, author, description"),
    only_available: bool = Query(False, description="Only show in-stock books"),
    db: Session = Depends(get_db)
):
    seed_books_if_empty(db)
    query = db.query(StoreBook)

    if category:
        query = query.filter(StoreBook.category == category)
    if only_available:
        query = query.filter(StoreBook.stock_quantity > 0, StoreBook.is_available == True)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (StoreBook.title.ilike(term)) |
            (StoreBook.author.ilike(term)) |
            (StoreBook.description.ilike(term)) |
            (StoreBook.publisher.ilike(term))
        )

    return query.order_by(StoreBook.is_available.desc(), StoreBook.rating.desc(), StoreBook.title.asc()).all()


@router.get("/books/{book_id}", response_model=StoreBookResponse)
def get_book_detail(book_id: int, db: Session = Depends(get_db)):
    seed_books_if_empty(db)
    book = db.query(StoreBook).filter(StoreBook.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/orders", response_model=StoreOrderResponse)
def place_order(
    req: StoreOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()
        if not student:
            raise HTTPException(status_code=400, detail="No student record found to place book order")

    book = db.query(StoreBook).filter(StoreBook.id == req.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if book.stock_quantity <= 0 or not book.is_available:
        restock_msg = f" Expected in stock by {book.expected_restock_date}." if book.expected_restock_date else ""
        raise HTTPException(
            status_code=400,
            detail=f"This book is currently out of stock.{restock_msg}"
        )

    # Calculate return due date (1-month loan duration = 30 days)
    issue_date = date.today()
    due_date = None
    price_paid = 0.0

    if req.order_type == BookOrderType.BORROW:
        # 1-Month borrowing loan (30 days limit)
        due_date = issue_date + timedelta(days=30)
        price_paid = book.borrow_fee
        order_remark = req.remarks or "1-Month Borrow Loan (₹20/day overdue fine after 30 days)"
    else:
        # Offline Buy: Reserve & settle offline at college library counter
        price_paid = book.price
        order_remark = req.remarks or "Offline Counter Settlement & Pickup at College Library"

    # Decrement stock
    book.stock_quantity -= 1
    if book.stock_quantity == 0:
        book.is_available = False
        book.expected_restock_date = issue_date + timedelta(days=7)

    order = StoreOrder(
        student_id=student.id,
        book_id=book.id,
        order_type=req.order_type,
        order_date=issue_date,
        due_date=due_date,
        price_paid=price_paid,
        status=BookOrderStatus.APPROVED,
        remarks=order_remark
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return StoreOrderResponse(
        id=order.id,
        student_id=order.student_id,
        book_id=order.book_id,
        book_title=book.title,
        book_author=book.author,
        cover_image=book.cover_image,
        order_type=order.order_type,
        order_date=order.order_date,
        due_date=order.due_date,
        price_paid=order.price_paid,
        status=order.status,
        remarks=order.remarks,
        created_at=order.created_at
    )



@router.get("/orders/my-orders", response_model=List[StoreOrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()
        if not student:
            return []

    orders = db.query(StoreOrder).filter(StoreOrder.student_id == student.id).order_by(StoreOrder.created_at.desc()).all()
    results = []
    for o in orders:
        results.append(StoreOrderResponse(
            id=o.id,
            student_id=o.student_id,
            book_id=o.book_id,
            book_title=o.book.title if o.book else "Unknown Book",
            book_author=o.book.author if o.book else "Unknown Author",
            cover_image=o.book.cover_image if o.book else None,
            order_type=o.order_type,
            order_date=o.order_date,
            due_date=o.due_date,
            price_paid=o.price_paid,
            status=o.status,
            remarks=o.remarks,
            created_at=o.created_at
        ))
    return results

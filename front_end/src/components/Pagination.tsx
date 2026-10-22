import "./Pagination.css";

interface PaginationProps {
    page: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    page,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
}: PaginationProps){
    return(
        <nav
            className="main-pagination"
            aria-label="Paginacion de Preguntas"
        >
            <button
                type="button"
                disabled={!hasPreviousPage}
                onClick={()=> onPageChange(page - 1)}
            >
                Anterior
            </button>

            <span className="main-page-number">
                {page}
            </span>

            <button
                type="button"
                disabled={!hasNextPage}
                onClick={() => onPageChange(page + 1)}
            >
                Siguiente
            </button>
        </nav>
    );
}
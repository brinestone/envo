package repo

type PaginationInput struct {
	Offset int `json:"offset,omitempty"`
	Size   int `json:"size,omitempty"`
}

type PaginationOutput[T any] struct {
	Data  []T `json:"data,omitempty"`
	Page  int `json:"page,omitempty"`
	Size  int `json:"size,omitempty"`
	Total int `json:"total,omitempty"`
}

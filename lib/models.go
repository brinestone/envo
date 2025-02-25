package lib

import (
	"database/sql"
	"time"
)

type Model struct {
	Id        string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Feature struct {
	Model
	Key         string
	Name        string
	Environment string
	IsEnabled   bool
}

type Variable struct {
	Model
	Environment string
	Value       string
	Name        string
}

type Environment struct {
	Model
	Name    string
	Project sql.NullString
}

type Credential struct {
	Model
	Provider    string
	AccessToken string
	Params      map[string]string
	Owner       sql.NullString
}

type User struct {
	Model
	Name  string
	Image sql.NullString
}

type Project struct {
	Model
	Name  string
	Owner sql.NullString
}

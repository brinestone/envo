package repo

import (
	"context"
	"database/sql"

	"github.com/brinestone/envo/lib"
	"github.com/brinestone/envo/lib/errors"
)

// const featureFields = "id,key,name,env,is_enabled,created_at,updated_at"

type Repository[T lib.Model] interface {
	scan(*sql.Row) (*T, error)
	scanMultiple(*sql.Rows) ([]*T, error)
	FindOne(context.Context, string) (*T, error)
	FindMany(context.Context, uint, uint) ([]*T, error)
	Insert(context.Context, ...any) (string, error)
	Update(context.Context, string, *T) error
	Delete(context.Context, string) error
}

type RepositoryConfig struct {
	Db *sql.DB
}

type FeatureRepository struct {
	*RepositoryConfig
}

func (fr *FeatureRepository) Delete(ctx context.Context, id string) (err error) {
	query := `
DELETE FROM features WHERE id=$1;
`
	t, err := fr.Db.BeginTx(ctx, nil)
	if err != nil {
		return
	}

	_, err = t.ExecContext(ctx, query, id)
	if err != nil {
		t.Rollback()
	}
	return
}

func (fr *FeatureRepository) Update(ctx context.Context, id string, update *lib.Feature) (err error) {
	err = errors.ErrNotSupported
	return
}

func (fr *FeatureRepository) Insert(ctx context.Context, args ...any) (id string, err error) {
	query := `
INSERT INTO
	features (key,name,env)
VALUES
	($1,$2,$3)
RETURNING id;
`
	err = fr.Db.QueryRowContext(ctx, query, args[0], args[1], args[2]).Scan(&id)
	return
}

func (fr *FeatureRepository) scan(row *sql.Row) (f *lib.Feature, err error) {
	f = &lib.Feature{}
	err = row.Scan(&f.Id, &f.Key, &f.Name, &f.Environment, &f.IsEnabled, &f.CreatedAt, &f.UpdatedAt)
	return
}

func (fr *FeatureRepository) scanMultiple(rows *sql.Rows) (f []*lib.Feature, err error) {
	for rows.Next() {
		var temp = new(lib.Feature)
		if err = rows.Scan(&temp.Id, &temp.Key, &temp.Environment, &temp.IsEnabled, &temp.CreatedAt, &temp.UpdatedAt); err != nil {
			f = []*lib.Feature{}
			return
		}
		f = append(f, temp)
	}
	return
}

func (fr *FeatureRepository) FindMany(ctx context.Context, offset uint, size uint) (ans []*lib.Feature, err error) {
	query := `
SELECT
	id,key,name,env,is_enabled,created_at,updated_at
FROM
	features
OFFSET
	$1
LIMIT
	$2;
`
	rows, err := fr.Db.QueryContext(ctx, query, offset, size)
	if err != nil {
		return
	}
	defer rows.Close()

	ans, err = fr.scanMultiple(rows)
	return
}

func (fr *FeatureRepository) FindOne(ctx context.Context, id string) (f *lib.Feature, err error) {
	row := fr.Db.QueryRowContext(ctx, `
SELECT 
    id,key,name,env,is_enabled,created_at,updated_at
FROM
    features
WHERE
    id = $1;
`, id)

	f, err = fr.scan(row)
	return
}

func NewFeatureRepository(config *RepositoryConfig) (repo *FeatureRepository, err error) {
	repo = &FeatureRepository{
		RepositoryConfig: config,
	}
	return
}

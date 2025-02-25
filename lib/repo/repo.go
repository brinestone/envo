package repo

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/brinestone/envo/lib"
)

const featureFields = "id,key,name,env,is_enabled,created_at,updated_at"

type Repository[T lib.Model] interface {
	tableName() string
	scan(*sql.Row) (*T, error)
	FindOne(context.Context, string) (*T, error)
	FindMany(context.Context) ([]T, error)
	Insert(context.Context, *T) error
	Update(context.Context, string, *T) error
	Delete(context.Context, string) error
}

type RepositoryConfig struct {
	Db *sql.DB
}

type FeatureRepository struct {
	*RepositoryConfig
}

func (fr *FeatureRepository) tableName() string {
	return "features"
}

func (fr *FeatureRepository) scan(row *sql.Row) (f *lib.Feature, err error) {
	f = &lib.Feature{}
	err = row.Scan(&f.Id, &f.Key, &f.Name, &f.Environment, &f.IsEnabled, &f.CreatedAt, &f.UpdatedAt)
	return
}

func (fr *FeatureRepository) FindOne(ctx context.Context, id string) (f *lib.Feature, err error) {
	row := fr.Db.QueryRowContext(ctx, fmt.Sprintf(`
SELECT %s FROM %s WHERE id = $1;
	`, featureFields, fr.tableName()), id)

	f, err = fr.scan(row)
	return
}

func NewFeatureRepository(config *RepositoryConfig) (repo *FeatureRepository, err error) {
	repo = &FeatureRepository{
		RepositoryConfig: config,
	}
	return
}

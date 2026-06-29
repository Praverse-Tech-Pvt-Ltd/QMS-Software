"""
Migration: enable pgvector extension and add VectorField columns to SOPChunk and FDA483Observation.
The embedding_json TextField is kept for backward compatibility until all data is migrated.

All operations are no-ops on non-PostgreSQL backends (e.g. sqlite used by the test suite)
since `vector` and `ivfflat` are PostgreSQL-only and this app has no pure-ORM equivalent
for them yet.
"""
from django.db import migrations

PG_SQL = [
    'CREATE EXTENSION IF NOT EXISTS vector;',
    'ALTER TABLE knowledge_sopchunk ADD COLUMN IF NOT EXISTS embedding vector(1536);',
    'ALTER TABLE knowledge_fda483observation ADD COLUMN IF NOT EXISTS embedding vector(1536);',
    (
        'CREATE INDEX IF NOT EXISTS knowledge_sopchunk_embedding_idx '
        'ON knowledge_sopchunk USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);'
    ),
    (
        'CREATE INDEX IF NOT EXISTS knowledge_fda483_embedding_idx '
        'ON knowledge_fda483observation USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);'
    ),
]

PG_REVERSE_SQL = [
    'DROP INDEX IF EXISTS knowledge_fda483_embedding_idx;',
    'DROP INDEX IF EXISTS knowledge_sopchunk_embedding_idx;',
    'ALTER TABLE knowledge_fda483observation DROP COLUMN IF EXISTS embedding;',
    'ALTER TABLE knowledge_sopchunk DROP COLUMN IF EXISTS embedding;',
    'DROP EXTENSION IF EXISTS vector;',
]


def enable_pgvector(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    for sql in PG_SQL:
        schema_editor.execute(sql)


def disable_pgvector(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    for sql in PG_REVERSE_SQL:
        schema_editor.execute(sql)


class Migration(migrations.Migration):

    dependencies = [
        ('knowledge', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(enable_pgvector, disable_pgvector),
    ]

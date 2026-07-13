"""
Phase 6 Block 1.1: switch embeddings from OpenAI text-embedding-3-small (1536 dim)
to local sentence-transformers/all-MiniLM-L6-v2 (384 dim).

The `embedding` vector(1536) columns added in 0002_add_pgvector.py are raw-SQL-only
(no ORM field reads/writes them — see knowledge/tasks.py and knowledge/sop_ingestion.py,
which both use `embedding_json` instead). This migration resizes those columns to
vector(384) so they stay consistent with the new embedding dimension if/when they are
wired up to the ORM. A column can't be resized in place with data present, so it is
dropped and recreated — matching embedding_json='' rows queued for re-embedding anyway.

No-op on non-PostgreSQL backends (sqlite test runner), same as 0002.
"""
from django.db import migrations

PG_SQL = [
    'DROP INDEX IF EXISTS knowledge_sopchunk_embedding_idx;',
    'DROP INDEX IF EXISTS knowledge_fda483_embedding_idx;',
    'ALTER TABLE knowledge_sopchunk DROP COLUMN IF EXISTS embedding;',
    'ALTER TABLE knowledge_fda483observation DROP COLUMN IF EXISTS embedding;',
    'ALTER TABLE knowledge_sopchunk ADD COLUMN embedding vector(384);',
    'ALTER TABLE knowledge_fda483observation ADD COLUMN embedding vector(384);',
    (
        'CREATE INDEX knowledge_sopchunk_embedding_idx '
        'ON knowledge_sopchunk USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);'
    ),
    (
        'CREATE INDEX knowledge_fda483_embedding_idx '
        'ON knowledge_fda483observation USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);'
    ),
]

PG_REVERSE_SQL = [
    'DROP INDEX IF EXISTS knowledge_sopchunk_embedding_idx;',
    'DROP INDEX IF EXISTS knowledge_fda483_embedding_idx;',
    'ALTER TABLE knowledge_sopchunk DROP COLUMN IF EXISTS embedding;',
    'ALTER TABLE knowledge_fda483observation DROP COLUMN IF EXISTS embedding;',
    'ALTER TABLE knowledge_sopchunk ADD COLUMN embedding vector(1536);',
    'ALTER TABLE knowledge_fda483observation ADD COLUMN embedding vector(1536);',
    (
        'CREATE INDEX knowledge_sopchunk_embedding_idx '
        'ON knowledge_sopchunk USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);'
    ),
    (
        'CREATE INDEX knowledge_fda483_embedding_idx '
        'ON knowledge_fda483observation USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);'
    ),
]


def resize_to_384(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    for sql in PG_SQL:
        schema_editor.execute(sql)


def resize_to_1536(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    for sql in PG_REVERSE_SQL:
        schema_editor.execute(sql)


class Migration(migrations.Migration):

    dependencies = [
        ('knowledge', '0002_add_pgvector'),
    ]

    operations = [
        migrations.RunPython(resize_to_384, resize_to_1536),
    ]

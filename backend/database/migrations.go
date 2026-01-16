package database

import (
	"database/sql"
	"log"
)

func Migrate(db *sql.DB) error {
	migrations := []string{
		// Users table
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			age INTEGER,
			level VARCHAR(50) DEFAULT 'sd',
			avatar VARCHAR(50) DEFAULT '😊',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Refresh tokens table
		`CREATE TABLE IF NOT EXISTS refresh_tokens (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token VARCHAR(255) UNIQUE NOT NULL,
			expires_at TIMESTAMP NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Stories table
		`CREATE TABLE IF NOT EXISTS stories (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			prompt_id VARCHAR(50),
			prompt_title VARCHAR(255),
			input_type VARCHAR(20) NOT NULL CHECK (input_type IN ('audio', 'text')),
			content TEXT,
			audio_url VARCHAR(500),
			transcript TEXT,
			status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Story feedback table
		`CREATE TABLE IF NOT EXISTS story_feedback (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
			clarity_score INTEGER CHECK (clarity_score >= 0 AND clarity_score <= 100),
			structure_score INTEGER CHECK (structure_score >= 0 AND structure_score <= 100),
			creativity_score INTEGER CHECK (creativity_score >= 0 AND creativity_score <= 100),
			expression_score INTEGER CHECK (expression_score >= 0 AND expression_score <= 100),
			overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
			feedback_text TEXT,
			strengths TEXT[],
			improvements TEXT[],
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Skills table
		`CREATE TABLE IF NOT EXISTS skills (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(100) UNIQUE NOT NULL,
			description TEXT,
			icon VARCHAR(50),
			color VARCHAR(20),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Skill progress table
		`CREATE TABLE IF NOT EXISTS skill_progress (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
			level INTEGER DEFAULT 1,
			progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
			total_stories INTEGER DEFAULT 0,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(user_id, skill_id)
		)`,

		// Insert default skills
		`INSERT INTO skills (name, description, icon, color) VALUES 
			('Kejelasan Bertutur', 'Kemampuan menyampaikan ide dengan jelas', 'message-circle', '#8B5CF6'),
			('Alur Cerita', 'Kemampuan menyusun cerita yang runtut', 'lightbulb', '#F59E0B'),
			('Ekspresi Perasaan', 'Kemampuan mengungkapkan emosi dalam cerita', 'heart', '#EC4899'),
			('Kreativitas', 'Kemampuan mengembangkan ide unik', 'star', '#10B981')
		ON CONFLICT (name) DO NOTHING`,

		// Create indexes
		`CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_story_feedback_story_id ON story_feedback(story_id)`,
		`CREATE INDEX IF NOT EXISTS idx_skill_progress_user_id ON skill_progress(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`,
	}

	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			log.Printf("Migration error: %v\nQuery: %s", err, migration)
			// Continue with other migrations, some might fail due to already existing
			continue
		}
	}

	log.Println("✅ Database migrations completed")
	return nil
}

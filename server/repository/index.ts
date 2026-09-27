import { CentralRepository } from './interface';
import { MemoryCentralRepository } from './memoryRepository';
import { PostgresCentralRepository } from './postgresRepository';

/**
 * REPOSITORY FACTORY & RUNTIME REGISTRY
 * 
 * Auto-detects runtime environment:
 * - If DATABASE_URL is provided, activates PostgresCentralRepository.
 * - Otherwise, provides high-performance MemoryCentralRepository for test & dev.
 */
class RepositoryManager {
  private activeRepository: CentralRepository;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl && databaseUrl.trim().length > 0 && !databaseUrl.includes('placeholder')) {
      console.log('[Central Backend] Active persistence provider: PostgreSQL');
      this.activeRepository = new PostgresCentralRepository(databaseUrl);
    } else {
      console.log('[Central Backend] Active persistence provider: In-Memory Relational Store (DEV/TEST)');
      this.activeRepository = new MemoryCentralRepository();
    }
  }

  getRepository(): CentralRepository {
    return this.activeRepository;
  }

  setRepository(repo: CentralRepository) {
    this.activeRepository = repo;
  }
}

export const repositoryManager = new RepositoryManager();
export const centralRepo = repositoryManager.getRepository();

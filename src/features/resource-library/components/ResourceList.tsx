import type { Resource } from '../../../stores/resourceStore';
import { ResourceCard } from './ResourceCard';
import { useTranslation } from 'react-i18next';

interface Props {
  resources: Resource[];
  isLoading: boolean;
  onEdit: (r: Resource) => void;
  onDelete: (id: string) => void;
  onLoadToStudio?: (r: Resource) => void;
}

export const ResourceList = ({ resources, isLoading, onEdit, onDelete, onLoadToStudio }: Props) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="text-[var(--text-secondary)] p-8 text-center animate-pulse">
        {t('library.loading')}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-[var(--text-secondary)] p-12 text-center border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]/50">
        <p>{t('library.empty.title')}</p>
        <p className="text-sm mt-2 opacity-60">{t('library.empty.subtitle')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
      {resources.map((r) => (
        <ResourceCard
          key={r.id}
          resource={r}
          onEdit={onEdit}
          onDelete={onDelete}
          onLoadToStudio={onLoadToStudio}
        />
      ))}
    </div>
  );
};

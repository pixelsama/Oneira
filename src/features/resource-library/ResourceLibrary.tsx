import { useEffect, useState } from 'react';
import { useResourceStore, type Resource } from '../../stores/resourceStore';
import { useGenerationStore } from '../../stores/generationStore';
import { ResourceList } from './components/ResourceList';
import { ResourceEditor } from './components/ResourceEditor';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const ResourceLibrary = () => {
  const { resources, isLoading, loadResources, createResource, updateResource, deleteResource } =
    useResourceStore();
  const { loadResource } = useGenerationStore();
  const navigate = useNavigate();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleSave = async (data: {
    name: string;
    description: string;
    prompt: string;
    imagePaths: string[];
  }) => {
    try {
      if (editingResource) {
        await updateResource({ id: editingResource.id, ...data });
        toast.success('Resource updated.');
      } else {
        await createResource(data);
        toast.success('Resource created.');
      }
      setIsEditorOpen(false);
      setEditingResource(null);
    } catch (e) {
      // 在控制台打印完整的错误，方便开发时调试
      console.error('Save resource error:', e);
      // 给用户显示简明扼要的信息
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`Failed to save resource. (${errorMessage})`);
    }
  };

  const handleEdit = (r: Resource) => {
    setEditingResource(r);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      await deleteResource(id);
      toast.success('Resource deleted.');
    }
  };

  const handleOpenNew = () => {
    setEditingResource(null);
    setIsEditorOpen(true);
  };

  const handleLoadToStudio = (r: Resource) => {
    loadResource(r);
    toast.success('Resource loaded to Studio');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full p-8 gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Resource Library</h1>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-primary)] px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
        >
          <Plus size={18} /> New Resource
        </button>
      </div>

      <ResourceList
        resources={resources}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLoadToStudio={handleLoadToStudio}
      />

      <ResourceEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialData={editingResource}
        onSave={handleSave}
      />
    </div>
  );
};

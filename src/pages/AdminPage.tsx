import React, { useEffect, useState } from 'react';
import { listDishTypes, createDishType } from '../services/dishType';
import { createDish, addDishCategories, removeDishCategories } from '../services/dish';
import { DishContributionService } from '../services/userService';

type DishTypeItem = {
  id?: string;
  Id?: string;
  typeName?: string;
  TypeName?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
};

const AdminPage: React.FC = () => {
  const [dishTypes, setDishTypes] = useState<DishTypeItem[]>([]);
  const [dtForm, setDtForm] = useState({ typeName: '', description: '', displayOrder: 0, isActive: true });
  const [dishForm, setDishForm] = useState({ name: '', description: '', tags: '', typeIds: '' });
  const [manageDishId, setManageDishId] = useState('');
  const [manageAddTypes, setManageAddTypes] = useState<string>('');
  const [manageRemoveTypes, setManageRemoveTypes] = useState<string>('');
  const [contribForm, setContribForm] = useState({ name: '', description: '', tags: '', category: '', icon: '' });

  useEffect(() => {
    listDishTypes().then(res => setDishTypes(res?.data ?? res ?? []));
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Tools (tạm thời)</h1>

      {/* DishType */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">DishType</h2>
        <div className="flex space-x-2 items-center">
          <input className="border px-2 py-1 rounded" placeholder="Type name" value={dtForm.typeName} onChange={e => setDtForm({ ...dtForm, typeName: e.target.value })} />
          <input className="border px-2 py-1 rounded" placeholder="Description" value={dtForm.description} onChange={e => setDtForm({ ...dtForm, description: e.target.value })} />
          <input className="border px-2 py-1 rounded w-24" type="number" placeholder="Order" value={dtForm.displayOrder} onChange={e => setDtForm({ ...dtForm, displayOrder: Number(e.target.value) })} />
          <label className="text-sm flex items-center space-x-1"><input type="checkbox" checked={dtForm.isActive} onChange={e => setDtForm({ ...dtForm, isActive: e.target.checked })} /> <span>Active</span></label>
          <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={async () => {
            const res = await createDishType(dtForm);
            alert('Created: ' + (res?.typeName || 'OK'));
            const list = await listDishTypes();
            setDishTypes(list?.data ?? list ?? []);
          }}>Add Type</button>
        </div>
        <div className="text-sm text-gray-600">Hiện có: {dishTypes.length} loại</div>
      </section>

      {/* Create Dish với nhiều category */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Create Dish</h2>
        <div className="grid grid-cols-2 gap-2 max-w-2xl">
          <input className="border px-2 py-1 rounded" placeholder="Name" value={dishForm.name} onChange={e => setDishForm({ ...dishForm, name: e.target.value })} />
          <input className="border px-2 py-1 rounded" placeholder="Tags" value={dishForm.tags} onChange={e => setDishForm({ ...dishForm, tags: e.target.value })} />
          <textarea className="border px-2 py-1 rounded col-span-2" placeholder="Description" value={dishForm.description} onChange={e => setDishForm({ ...dishForm, description: e.target.value })} />
          <input className="border px-2 py-1 rounded col-span-2" placeholder="TypeIds (comma separated)" value={dishForm.typeIds} onChange={e => setDishForm({ ...dishForm, typeIds: e.target.value })} />
        </div>
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={async () => {
          const typeIds = dishForm.typeIds.split(',').map(s => s.trim()).filter(Boolean);
          const res = await createDish({ name: dishForm.name, description: dishForm.description, tags: dishForm.tags, typeIds });
          alert('Created dish: ' + (res?.name || 'OK'));
        }}>Create Dish</button>
      </section>

      {/* Manage Dish Categories: add/remove */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Manage Dish Categories</h2>
        <div className="grid grid-cols-2 gap-2 max-w-2xl">
          <input className="border px-2 py-1 rounded col-span-2" placeholder="DishId" value={manageDishId} onChange={e => setManageDishId(e.target.value)} />
          <input className="border px-2 py-1 rounded" placeholder="Add TypeIds (comma)" value={manageAddTypes} onChange={e => setManageAddTypes(e.target.value)} />
          <input className="border px-2 py-1 rounded" placeholder="Remove TypeIds (comma)" value={manageRemoveTypes} onChange={e => setManageRemoveTypes(e.target.value)} />
        </div>
        <div className="space-x-2">
          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async () => {
            const ids = manageAddTypes.split(',').map(s => s.trim()).filter(Boolean);
            const res = await addDishCategories(manageDishId, ids);
            alert('Added: ' + JSON.stringify(res));
          }}>Add Types</button>
          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={async () => {
            const ids = manageRemoveTypes.split(',').map(s => s.trim()).filter(Boolean);
            const res = await removeDishCategories(manageDishId, ids);
            alert('Removed: ' + JSON.stringify(res));
          }}>Remove Types</button>
        </div>
      </section>

      {/* Contribute Dish */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contribute Dish</h2>
        <div className="grid grid-cols-2 gap-2 max-w-2xl">
          <input className="border px-2 py-1 rounded" placeholder="Name" value={contribForm.name} onChange={e => setContribForm({ ...contribForm, name: e.target.value })} />
          <input className="border px-2 py-1 rounded" placeholder="Icon (emoji)" value={contribForm.icon} onChange={e => setContribForm({ ...contribForm, icon: e.target.value })} />
          <input className="border px-2 py-1 rounded" placeholder="Category" value={contribForm.category} onChange={e => setContribForm({ ...contribForm, category: e.target.value })} />
          <input className="border px-2 py-1 rounded" placeholder="Tags" value={contribForm.tags} onChange={e => setContribForm({ ...contribForm, tags: e.target.value })} />
          <textarea className="border px-2 py-1 rounded col-span-2" placeholder="Description" value={contribForm.description} onChange={e => setContribForm({ ...contribForm, description: e.target.value })} />
        </div>
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async () => {
          const res = await DishContributionService.create(contribForm);
          alert('Contributed: ' + (res?.message || 'OK'));
        }}>Submit Contribution</button>
      </section>

    </div>
  );
};

export default AdminPage;



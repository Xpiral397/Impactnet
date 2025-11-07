'use client';

import { useState } from 'react';
import { Pencil, Trash2, AlertCircle, X } from 'lucide-react';

// Mock data types
interface Evaluator {
  id: number;
  name: string;
  description: string;
  evaluation_type: string;
  max_score: number;
  passing_score: number;
  can_edit: boolean;
  can_delete: boolean;
  has_functions: boolean;
  function_count: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  evaluators: Evaluator[];
  can_delete: boolean;
  has_evaluators: boolean;
  evaluator_count: number;
  is_own_task: boolean;
}

// Mock data
const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Python Basics Assessment',
    description: 'Introduction to Python programming',
    status: 'in_progress',
    evaluators: [
      {
        id: 1,
        name: 'Quiz 1',
        description: 'Variables and Data Types',
        evaluation_type: 'quiz',
        max_score: 100,
        passing_score: 70,
        can_edit: true,
        can_delete: false, // Trainers cannot delete
        has_functions: false,
        function_count: 0,
      },
      {
        id: 2,
        name: 'Assignment 1',
        description: 'Build a calculator',
        evaluation_type: 'assignment',
        max_score: 100,
        passing_score: 80,
        can_edit: true,
        can_delete: false, // Trainers cannot delete
        has_functions: true,
        function_count: 3,
      },
    ],
    can_delete: false,
    has_evaluators: true,
    evaluator_count: 2,
    is_own_task: true,
  },
  {
    id: 2,
    title: 'React Fundamentals',
    description: 'Learn React basics',
    status: 'pending',
    evaluators: [],
    can_delete: true,
    has_evaluators: false,
    evaluator_count: 0,
    is_own_task: true,
  },
  {
    id: 3,
    title: 'Advanced JavaScript',
    description: 'Deep dive into JS',
    status: 'completed',
    evaluators: [
      {
        id: 3,
        name: 'Final Project',
        description: 'Build a web app',
        evaluation_type: 'project',
        max_score: 100,
        passing_score: 75,
        can_edit: false, // Not their task
        can_delete: false,
        has_functions: false,
        function_count: 0,
      },
    ],
    can_delete: false,
    has_evaluators: true,
    evaluator_count: 1,
    is_own_task: false,
  },
];

export default function TrainerDashboard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedEvaluator, setSelectedEvaluator] = useState<Evaluator | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Get user info from your existing sidebar/profile system
  // TODO: Replace this with actual user data from your auth/profile context
  const currentUser = {
    role: 'trainer' as const,
    name: 'Current User',
    can_delete_tasks: false // This should come from your sidebar/profile
  };

  // Check if current user is trainer (for info banner)
  const isTrainer = currentUser.role === 'trainer';

  // Use can_delete_tasks to determine if delete button should show
  const canShowDeleteButton = currentUser.can_delete_tasks === true;

  const handleEditEvaluator = (evaluator: Evaluator) => {
    setSelectedEvaluator(evaluator);
    setShowEditModal(true);
  };

  const handleDeleteTask = (task: Task) => {
    if (!task.can_delete) {
      setTaskToDelete(task);
      setShowDeleteModal(true);
    } else {
      // Proceed with deletion
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
  };

  const handleSaveEvaluator = () => {
    // Save logic here
    setShowEditModal(false);
    setSelectedEvaluator(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-black mb-4">Trainer Dashboard</h1>


        {/* Info Banner - Only show for trainers */}
        {isTrainer && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Trainer Permissions:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• You can <strong>edit</strong> evaluators for your own tasks</li>
                <li>• You <strong>cannot delete</strong> any evaluators - only Admin and Reviewers can delete</li>
                <li>• Evaluators with functions cannot be deleted by anyone</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl shadow-sm p-6">
              {/* Task Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-black mb-2">{task.title}</h2>
                  <p className="text-gray-600 mb-2">{task.description}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {/* Only show delete button if can_delete_tasks is true in localStorage */}
                {canShowDeleteButton && (
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Evaluators */}
              {task.evaluators.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-black mb-3">
                    Evaluators ({task.evaluator_count})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.evaluators.map((evaluator) => (
                      <div
                        key={evaluator.id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-black">{evaluator.name}</h4>
                              {evaluator.has_functions && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                                  {evaluator.function_count} function{evaluator.function_count !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{evaluator.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Max: {evaluator.max_score}</span>
                              <span>Pass: {evaluator.passing_score}</span>
                              <span className="capitalize">{evaluator.evaluation_type}</span>
                            </div>
                          </div>
                          {evaluator.can_edit && (
                            <button
                              onClick={() => handleEditEvaluator(evaluator)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit evaluator (Trainers can only edit, not delete)"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Evaluator Modal */}
      {showEditModal && selectedEvaluator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Edit Evaluator</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={selectedEvaluator.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Description</label>
                <textarea
                  defaultValue={selectedEvaluator.description}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Max Score</label>
                  <input
                    type="number"
                    defaultValue={selectedEvaluator.max_score}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Passing Score
                  </label>
                  <input
                    type="number"
                    defaultValue={selectedEvaluator.passing_score}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Evaluation Type
                </label>
                <select
                  defaultValue={selectedEvaluator.evaluation_type}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="presentation">Presentation</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveEvaluator}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-black font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Prevention Modal */}
      {showDeleteModal && taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-black text-center mb-4">
              Cannot Delete Task
            </h2>

            <p className="text-gray-600 text-center mb-6">
              This task has <span className="font-bold text-black">{taskToDelete.evaluator_count}</span> evaluator{taskToDelete.evaluator_count !== 1 ? 's' : ''} and cannot be deleted. Please remove all evaluators first before deleting this task.
            </p>

            <button
              onClick={() => {
                setShowDeleteModal(false);
                setTaskToDelete(null);
              }}
              className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

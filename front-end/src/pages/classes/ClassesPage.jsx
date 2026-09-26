import ClassesTable from "../../components/classes/ClassesTable";
import TableActions from "../../components/classes/TableActions";

import { useSelector } from "react-redux";

export default function ClassesPage() {
    const { data } = useSelector((state) => state.classes.classesList);
    const { user } = useSelector((state) => state.user);

    const isAdmin = user?.role === "admin";
    const isParent = user?.role === "parent";

    return (
        <div className="min-h-screen w-full bg-slate-50 p-6">
            <div className="mx-auto max-w-full rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h1 className="text-lg font-bold text-slate-900">
                        All Classes ({data?.totalClasses || 0})
                    </h1>

                    <TableActions isAdmin={isAdmin} isParent={isParent} />
                </div>

                <ClassesTable isAdmin={isAdmin} />
            </div>
        </div>
    );
}

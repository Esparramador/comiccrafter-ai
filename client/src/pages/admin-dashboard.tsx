import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Users, Activity, ShieldAlert, Cpu, Database, Wrench, Ban, Search, CheckCircle2, Plus, Trash2, Edit, DollarSign, TrendingUp, Brain, Send, BarChart3, Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppUser, ServiceLimit, SubscriptionPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [economistQuestion, setEconomistQuestion] = useState("");
  const [economistResponse, setEconomistResponse] = useState("");
  const [isEconomistLoading, setIsEconomistLoading] = useState(false);

  const [planForm, setPlanForm] = useState({
    name: "", displayName: "", description: "", priceMonthly: 0, priceYearly: 0,
    currency: "EUR", maxImages: 0, maxVideos: 0, max3dModels: 0, maxScripts: 0,
    maxVoices: 0, isActive: true, sortOrder: 0, badgeColor: "#8B5CF6",
    features: [] as string[],
  });
  const [newFeature, setNewFeature] = useState("");

  const { data: stats } = useQuery<{
    totalUsers: number; totalGenerations: number; totalImages: number;
    totalScripts: number; totalCharacters: number;
    planBreakdown: { plan: string; count: number }[];
    activeUsers: number; bannedUsers: number;
  }>({ queryKey: ["/api/admin/stats"] });

  const { data: users = [] } = useQuery<AppUser[]>({
    queryKey: ["/api/admin/users", searchTerm],
    queryFn: () => fetch(`/api/admin/users${searchTerm ? `?search=${searchTerm}` : ""}`).then(r => r.json()),
  });

  const { data: serviceLimits = [] } = useQuery<ServiceLimit[]>({ queryKey: ["/api/admin/service-limits"] });
  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({ queryKey: ["/api/admin/plans"] });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<AppUser> & { id: number }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Usuario actualizado" });
    },
  });

  const updateLimitMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ServiceLimit> & { id: number }) => {
      const res = await apiRequest("PUT", `/api/admin/service-limits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-limits"] });
      toast({ title: "Límite actualizado" });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/plans", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setShowPlanDialog(false);
      resetPlanForm();
      toast({ title: "Plan creado" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/admin/plans/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setShowPlanDialog(false);
      setEditingPlan(null);
      resetPlanForm();
      toast({ title: "Plan actualizado" });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      toast({ title: "Plan eliminado" });
    },
  });

  const resetPlanForm = () => {
    setPlanForm({ name: "", displayName: "", description: "", priceMonthly: 0, priceYearly: 0, currency: "EUR", maxImages: 0, maxVideos: 0, max3dModels: 0, maxScripts: 0, maxVoices: 0, isActive: true, sortOrder: 0, badgeColor: "#8B5CF6", features: [] });
    setNewFeature("");
  };

  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name, displayName: plan.displayName, description: plan.description,
      priceMonthly: plan.priceMonthly, priceYearly: plan.priceYearly, currency: plan.currency,
      maxImages: plan.maxImages, maxVideos: plan.maxVideos, max3dModels: plan.max3dModels,
      maxScripts: plan.maxScripts, maxVoices: plan.maxVoices, isActive: plan.isActive,
      sortOrder: plan.sortOrder, badgeColor: plan.badgeColor,
      features: Array.isArray(plan.features) ? plan.features as string[] : [],
    });
    setShowPlanDialog(true);
  };

  const handleSavePlan = () => {
    const data = { ...planForm, features: planForm.features };
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, ...data });
    } else {
      createPlanMutation.mutate(data);
    }
  };

  const askEconomist = async () => {
    if (!economistQuestion.trim()) return;
    setIsEconomistLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ai/economist", {
        currentPlans: plans,
        question: economistQuestion,
      });
      const data = await res.json();
      setEconomistResponse(data.analysis || "Sin respuesta");
    } catch (e: any) {
      setEconomistResponse("Error consultando al economista IA: " + e.message);
    }
    setIsEconomistLoading(false);
  };

  const planOptions = ["free", "pro", "vip"];
  const services = ["images", "videos", "3d_models", "scripts", "voices"];

  const paidUsers = users.filter(u => u.plan !== "free");
  const freeUsers = users.filter(u => u.plan === "free");

  return (
    <div className="flex flex-col h-full bg-[#050505] text-green-400 font-mono overflow-y-auto animate-in fade-in duration-500 pb-10">
      <header className="border-b border-green-900/30 bg-[#0A0A0A] p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-900/30 border border-green-500/50 flex items-center justify-center text-green-400 rounded-sm">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl uppercase tracking-widest">Sudo Panel</h1>
            <p className="text-[10px] text-green-500/50">Logged in as: sadiagiljoan@gmail.com [ROOT]</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-[10px] text-green-500/50 uppercase">Server Status</p>
            <p className="text-sm text-green-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> ONLINE
            </p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#0A0A0A] border border-green-900/30 w-full justify-start gap-0 rounded-sm h-auto p-1">
            {[
              { value: "overview", icon: BarChart3, label: "Dashboard" },
              { value: "users", icon: Users, label: "Usuarios" },
              { value: "plans", icon: Crown, label: "Planes" },
              { value: "limits", icon: Wrench, label: "Límites" },
              { value: "economist", icon: Brain, label: "IA Economist" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none text-xs uppercase tracking-wider data-[state=active]:bg-green-900/30 data-[state=active]:text-green-400 text-green-700 font-bold flex items-center gap-2 px-4 py-2"
                data-testid={`tab-${tab.value}`}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0, color: "green" },
                { icon: Activity, label: "Generaciones IA", value: stats?.totalGenerations ?? 0, color: "green" },
                { icon: Database, label: "Imágenes", value: stats?.totalImages ?? 0, color: "green" },
                { icon: ShieldAlert, label: "Guiones", value: stats?.totalScripts ?? 0, color: "red" },
                { icon: CheckCircle2, label: "Activos", value: stats?.activeUsers ?? 0, color: "green" },
                { icon: Ban, label: "Baneados", value: stats?.bannedUsers ?? 0, color: "red" },
              ].map((s, i) => (
                <Card key={i} className={`bg-[#0A0A0A] border-${s.color}-900/30 p-3 rounded-sm flex items-center gap-3`}>
                  <s.icon className={`w-6 h-6 text-${s.color}-500/70`} />
                  <div>
                    <p className={`text-[10px] text-${s.color}-500/50 uppercase`}>{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-[#0A0A0A] border-green-900/30 rounded-sm p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Distribución por Plan
                </h3>
                <div className="space-y-2">
                  {stats?.planBreakdown?.map((pb, i) => {
                    const total = stats.totalUsers || 1;
                    const pct = Math.round((pb.count / total) * 100);
                    const colors: Record<string, string> = { free: "bg-gray-500", pro: "bg-blue-500", vip: "bg-purple-500" };
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="uppercase font-bold">{pb.plan}</span>
                          <span>{pb.count} usuarios ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-green-900/20 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[pb.plan] || "bg-green-500"} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {(!stats?.planBreakdown || stats.planBreakdown.length === 0) && (
                    <p className="text-xs text-green-700">Sin datos de usuarios aún</p>
                  )}
                </div>
              </Card>

              <Card className="bg-[#0A0A0A] border-green-900/30 rounded-sm p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Resumen de Suscripciones
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-black/40 p-3 border border-green-900/10">
                    <span className="text-xs">Usuarios de Pago</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 rounded-none text-xs">{paidUsers.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-3 border border-green-900/10">
                    <span className="text-xs">Usuarios Gratuitos</span>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 rounded-none text-xs">{freeUsers.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-3 border border-green-900/10">
                    <span className="text-xs">Planes Activos</span>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 rounded-none text-xs">{plans.filter(p => p.isActive).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-3 border border-green-900/10">
                    <span className="text-xs">Tasa de Conversión</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 rounded-none text-xs">
                      {users.length > 0 ? Math.round((paidUsers.length / users.length) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Card className="bg-[#0A0A0A] border-green-900/30 rounded-sm">
              <div className="p-4 border-b border-green-900/30 flex justify-between items-center flex-wrap gap-2">
                <h2 className="uppercase font-bold tracking-wider flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" /> Control de Usuarios ({users.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-2 top-2 w-4 h-4 text-green-900" />
                  <Input
                    placeholder="Buscar email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 h-8 bg-black border-green-900/50 text-green-400 placeholder:text-green-900 rounded-sm text-xs pl-8"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-green-900/10 text-green-500/50 text-xs uppercase border-b border-green-900/30">
                    <tr>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Gens</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Pago</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-900/20">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-green-900/5" data-testid={`row-user-${u.id}`}>
                        <td className="px-4 py-3 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <Select value={u.plan} onValueChange={(val) => updateUserMutation.mutate({ id: u.id, plan: val })}>
                            <SelectTrigger className="h-7 w-24 bg-black border-green-900/30 text-xs rounded-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-green-900 text-green-400">
                              {planOptions.map(p => (
                                <SelectItem key={p} value={p} className="uppercase text-xs">{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-xs">{u.totalGenerations}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`rounded-none text-[10px] uppercase ${u.status === 'banned' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-green-500 text-green-500 bg-green-500/10'}`}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`rounded-none text-[10px] ${u.plan !== 'free' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-gray-600 text-gray-500 bg-gray-500/10'}`}>
                            {u.plan !== 'free' ? 'PAGO' : 'GRATIS'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm" variant="outline"
                            onClick={() => updateUserMutation.mutate({ id: u.id, status: u.status === 'active' ? 'banned' : 'active' })}
                            className={`h-7 px-2 text-xs border-green-500/30 rounded-none ${u.status === 'active' ? 'text-red-400 hover:bg-red-500/20' : 'text-green-400 hover:bg-green-500/20'}`}
                            data-testid={`button-toggle-user-${u.id}`}
                          >
                            {u.status === 'active' ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-green-700 text-xs">Sin usuarios registrados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="uppercase font-bold tracking-wider flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4" /> Planes de Suscripción ({plans.length})
              </h2>
              <Button
                onClick={() => { resetPlanForm(); setEditingPlan(null); setShowPlanDialog(true); }}
                className="bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-500/30 rounded-sm text-xs h-9 gap-2"
                data-testid="button-create-plan"
              >
                <Plus className="w-4 h-4" /> Crear Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map(plan => (
                <Card key={plan.id} className="bg-[#0A0A0A] border-green-900/30 rounded-sm overflow-hidden" data-testid={`card-plan-${plan.id}`}>
                  <div className="p-1" style={{ backgroundColor: plan.badgeColor + "30" }}>
                    <div className="flex justify-between items-center px-3 py-2">
                      <h3 className="font-bold uppercase tracking-wider text-sm" style={{ color: plan.badgeColor }}>
                        {plan.displayName}
                      </h3>
                      <Badge className={`rounded-none text-[10px] ${plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {plan.isActive ? "ACTIVO" : "INACTIVO"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">{plan.priceMonthly}</span>
                      <span className="text-xs text-green-700">{plan.currency}/mes</span>
                      <span className="text-[10px] text-green-900 ml-2">({plan.priceYearly} {plan.currency}/año)</span>
                    </div>
                    <p className="text-[11px] text-green-700">{plan.description}</p>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between"><span className="text-green-700">Imágenes</span><span>{plan.maxImages}</span></div>
                      <div className="flex justify-between"><span className="text-green-700">Vídeos</span><span>{plan.maxVideos}</span></div>
                      <div className="flex justify-between"><span className="text-green-700">Modelos 3D</span><span>{plan.max3dModels}</span></div>
                      <div className="flex justify-between"><span className="text-green-700">Guiones</span><span>{plan.maxScripts}</span></div>
                      <div className="flex justify-between"><span className="text-green-700">Voces</span><span>{plan.maxVoices}</span></div>
                    </div>
                    {Array.isArray(plan.features) && (plan.features as string[]).length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-green-900/20">
                        {(plan.features as string[]).map((f, i) => (
                          <p key={i} className="text-[10px] text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-500" /> {f}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => openEditPlan(plan)}
                        className="flex-1 h-7 text-[10px] border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-none gap-1"
                        data-testid={`button-edit-plan-${plan.id}`}
                      >
                        <Edit className="w-3 h-3" /> Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deletePlanMutation.mutate(plan.id)}
                        className="h-7 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-none px-2"
                        data-testid={`button-delete-plan-${plan.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {plans.length === 0 && (
                <Card className="bg-[#0A0A0A] border-green-900/30 rounded-sm col-span-full p-8 text-center">
                  <p className="text-green-700 text-xs">No hay planes creados. Crea tu primer plan de suscripción.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="limits" className="mt-4">
            <Card className="bg-[#0A0A0A] border-green-900/30 rounded-sm p-4">
              <h2 className="uppercase font-bold tracking-wider flex items-center gap-2 text-sm mb-4">
                <Wrench className="w-4 h-4" /> Límites de Servicio por Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {planOptions.map(plan => (
                  <div key={plan} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase text-green-500 border-b border-green-900/20 pb-1">{plan} Plan</h3>
                    <div className="grid gap-2">
                      {services.map(service => {
                        const limit = serviceLimits.find(l => l.planName === plan && l.serviceName === service);
                        if (!limit) return null;
                        return (
                          <div key={service} className="flex items-center justify-between gap-2 bg-black/40 p-2 border border-green-900/10">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-green-700">{service}</span>
                              <Input
                                type="number"
                                defaultValue={limit.maxQuantity}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (val !== limit.maxQuantity) updateLimitMutation.mutate({ id: limit.id, maxQuantity: val });
                                }}
                                className="w-16 h-6 bg-black border-green-900/50 text-green-400 text-[10px] rounded-none p-1"
                              />
                            </div>
                            <Switch
                              checked={limit.enabled}
                              onCheckedChange={(val) => updateLimitMutation.mutate({ id: limit.id, enabled: val })}
                              className="scale-75 data-[state=checked]:bg-green-600"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="economist" className="mt-4 space-y-4">
            <Card className="bg-[#0A0A0A] border-green-900/30 rounded-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-900/50 to-blue-900/50 border border-green-500/30 flex items-center justify-center rounded-sm">
                  <Brain className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <h2 className="font-bold text-lg uppercase tracking-wider">IA Economist Agent</h2>
                  <p className="text-[10px] text-green-700">Super IA Agent Economist Social Market Vending Services</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Analiza mis planes actuales y recomienda precios óptimos basados en el mercado real",
                    "¿Cómo debo estructurar mis planes para maximizar la conversión free a pro?",
                    "Compara los precios de ComicCrafter con la competencia (Midjourney, RunwayML, ElevenLabs)",
                    "¿Qué estrategia de monetización me recomiendas para una app de creación de cómics con IA?",
                    "¿Cómo integro Shopify para vender suscripciones y productos digitales?",
                    "Calcula el punto de equilibrio si tengo 1000 usuarios, 30% en plan Pro a 14.99€/mes",
                  ].map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setEconomistQuestion(q)}
                      className="h-auto py-2 px-3 text-left text-[10px] border-green-900/30 text-green-600 hover:text-green-400 hover:bg-green-900/20 rounded-none justify-start whitespace-normal"
                      data-testid={`button-economist-preset-${i}`}
                    >
                      {q}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={economistQuestion}
                    onChange={(e) => setEconomistQuestion(e.target.value)}
                    placeholder="Pregunta al economista IA sobre precios, planes, competencia, Shopify..."
                    className="bg-black border-green-900/50 text-green-400 placeholder:text-green-900 rounded-none text-xs min-h-[60px] resize-none"
                    data-testid="input-economist-question"
                  />
                  <Button
                    onClick={askEconomist}
                    disabled={isEconomistLoading || !economistQuestion.trim()}
                    className="bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-500/30 rounded-none px-4 self-end"
                    data-testid="button-ask-economist"
                  >
                    {isEconomistLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>

                {economistResponse && (
                  <div className="bg-black border border-green-900/50 rounded-sm p-4 max-h-[500px] overflow-y-auto">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-green-500 mb-2 flex items-center gap-2">
                      <Cpu className="w-3 h-3" /> Análisis del Economista IA
                    </h4>
                    <div className="text-xs text-green-400/80 whitespace-pre-wrap leading-relaxed" data-testid="text-economist-response">
                      {economistResponse}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="bg-[#0A0A0A] border-green-900/30 text-green-400 font-mono max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-400 uppercase tracking-widest text-sm flex items-center gap-2">
              <Crown className="w-4 h-4" /> {editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase text-green-700">Nombre (slug)</label>
                <Input value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  className="bg-black border-green-900/50 text-green-400 rounded-none text-xs h-8" placeholder="pro" data-testid="input-plan-name" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-green-700">Nombre Visible</label>
                <Input value={planForm.displayName} onChange={e => setPlanForm({ ...planForm, displayName: e.target.value })}
                  className="bg-black border-green-900/50 text-green-400 rounded-none text-xs h-8" placeholder="Plan Pro" data-testid="input-plan-display" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase text-green-700">Descripción</label>
              <Textarea value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                className="bg-black border-green-900/50 text-green-400 rounded-none text-xs min-h-[50px]" data-testid="input-plan-desc" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] uppercase text-green-700">Precio/mes</label>
                <Input type="number" value={planForm.priceMonthly} onChange={e => setPlanForm({ ...planForm, priceMonthly: parseInt(e.target.value) || 0 })}
                  className="bg-black border-green-900/50 text-green-400 rounded-none text-xs h-8" data-testid="input-plan-monthly" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-green-700">Precio/año</label>
                <Input type="number" value={planForm.priceYearly} onChange={e => setPlanForm({ ...planForm, priceYearly: parseInt(e.target.value) || 0 })}
                  className="bg-black border-green-900/50 text-green-400 rounded-none text-xs h-8" data-testid="input-plan-yearly" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-green-700">Moneda</label>
                <Select value={planForm.currency} onValueChange={val => setPlanForm({ ...planForm, currency: val })}>
                  <SelectTrigger className="bg-black border-green-900/50 text-green-400 rounded-none text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-900 text-green-400">
                    {["EUR", "USD", "GBP"].map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { key: "maxImages", label: "Imgs" },
                { key: "maxVideos", label: "Vids" },
                { key: "max3dModels", label: "3D" },
                { key: "maxScripts", label: "Scripts" },
                { key: "maxVoices", label: "Voces" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] uppercase text-green-700">{f.label}</label>
                  <Input type="number" value={(planForm as any)[f.key]}
                    onChange={e => setPlanForm({ ...planForm, [f.key]: parseInt(e.target.value) || 0 })}
                    className="bg-black border-green-900/50 text-green-400 rounded-none text-xs h-8" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase text-green-700">Color Badge</label>
                <Input type="color" value={planForm.badgeColor} onChange={e => setPlanForm({ ...planForm, badgeColor: e.target.value })}
                  className="bg-black border-green-900/50 rounded-none h-8 p-1 cursor-pointer" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-green-700">Orden</label>
                <Input type="number" value={planForm.sortOrder} onChange={e => setPlanForm({ ...planForm, sortOrder: parseInt(e.target.value) || 0 })}
                  className="bg-black border-green-900/50 text-green-400 rounded-none text-xs h-8" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase text-green-700">Características</label>
              <div className="flex gap-1 mb-2">
                <Input value={newFeature} onChange={e => setNewFeature(e.target.value)}
                  placeholder="Añadir característica..." onKeyDown={e => {
                    if (e.key === 'Enter' && newFeature.trim()) {
                      setPlanForm({ ...planForm, features: [...planForm.features, newFeature.trim()] });
                      setNewFeature("");
                    }
                  }}
                  className="bg-black border-green-900/50 text-green-400 rounded-none text-xs h-7 flex-1" />
                <Button size="sm" onClick={() => {
                  if (newFeature.trim()) {
                    setPlanForm({ ...planForm, features: [...planForm.features, newFeature.trim()] });
                    setNewFeature("");
                  }
                }} className="h-7 bg-green-900/30 text-green-400 border border-green-500/30 rounded-none px-2">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {planForm.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-black/40 px-2 py-1 border border-green-900/10 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="flex-1">{f}</span>
                    <button onClick={() => setPlanForm({ ...planForm, features: planForm.features.filter((_, fi) => fi !== i) })} className="text-red-500 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={planForm.isActive} onCheckedChange={val => setPlanForm({ ...planForm, isActive: val })} className="data-[state=checked]:bg-green-600" />
              <span className="text-xs">Plan Activo</span>
            </div>
            <Button onClick={handleSavePlan} disabled={!planForm.name || !planForm.displayName}
              className="w-full bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-500/30 rounded-none h-10 uppercase tracking-widest text-xs font-bold"
              data-testid="button-save-plan"
            >
              {editingPlan ? "Guardar Cambios" : "Crear Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

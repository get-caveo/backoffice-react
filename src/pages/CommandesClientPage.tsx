import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  PackageCheck,
  Truck,
  MapPin,
  XCircle,
  ClipboardList,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import * as commandeService from '@/services/commande-client.service';
import type { CommandeClient, StatutCommandeClient } from '@/services/commande-client.service';

// ============================================================================
// Constants
// ============================================================================

const STATUT_CONFIG: Record<
  StatutCommandeClient,
  { label: string; color: string; bg: string; border: string }
> = {
  EN_ATTENTE:     { label: 'En attente',     color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  CONFIRMEE:      { label: 'Confirmée',      color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' },
  EN_PREPARATION: { label: 'En préparation', color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200' },
  EXPEDIEE:       { label: 'Expédiée',       color: 'text-cyan-700',   bg: 'bg-cyan-50',    border: 'border-cyan-200' },
  LIVREE:         { label: 'Livrée',         color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200' },
  ANNULEE:        { label: 'Annulée',        color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200' },
};

const FILTER_TABS: { label: string; value: StatutCommandeClient | 'ALL' }[] = [
  { label: 'Toutes',          value: 'ALL' },
  { label: 'En attente',      value: 'EN_ATTENTE' },
  { label: 'Confirmées',      value: 'CONFIRMEE' },
  { label: 'En préparation',  value: 'EN_PREPARATION' },
  { label: 'Expédiées',       value: 'EXPEDIEE' },
  { label: 'Livrées',         value: 'LIVREE' },
  { label: 'Annulées',        value: 'ANNULEE' },
];

// Transitions disponibles par statut
const NEXT_ACTION: Record<
  StatutCommandeClient,
  { label: string; fn: string; icon: ReactNode; variant: 'default' | 'outline' } | null
> = {
  EN_ATTENTE:     { label: 'Confirmer',  fn: 'confirmer',  icon: <CheckCircle2 className="h-4 w-4" />,  variant: 'default' },
  CONFIRMEE:      { label: 'Préparer',   fn: 'preparer',   icon: <PackageCheck className="h-4 w-4" />, variant: 'default' },
  EN_PREPARATION: { label: 'Expédier',   fn: 'expedier',   icon: <Truck className="h-4 w-4" />,        variant: 'default' },
  EXPEDIEE:       { label: 'Marquer livré', fn: 'livrer',  icon: <MapPin className="h-4 w-4" />,       variant: 'default' },
  LIVREE:         null,
  ANNULEE:        null,
};

const PROGRESS_STEPS: StatutCommandeClient[] = [
  'EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE',
];

// ============================================================================
// Component
// ============================================================================

export function CommandesClientPage() {
  const { token } = useAuthStore();
  const [commandes, setCommandes] = useState<CommandeClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatutCommandeClient | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCommandes = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await commandeService.getAllCommandesClient(token);
      // Trier: plus récentes en premier
      data.sort((a, b) => new Date(b.dateCommande ?? b.creeLe ?? '').getTime()
                        - new Date(a.dateCommande ?? a.creeLe ?? '').getTime());
      setCommandes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCommandes();
  }, [fetchCommandes]);

  const handleAction = async (commande: CommandeClient, action: string) => {
    if (!token) return;
    setActionLoading(commande.id);
    setActionError(null);
    try {
      let updated: CommandeClient;
      if (action === 'confirmer') updated = await commandeService.confirmerCommande(token, commande.id);
      else if (action === 'preparer')  updated = await commandeService.preparerCommande(token, commande.id);
      else if (action === 'expedier')  updated = await commandeService.expedierCommande(token, commande.id);
      else if (action === 'livrer')    updated = await commandeService.livrerCommande(token, commande.id);
      else if (action === 'annuler')   updated = await commandeService.annulerCommande(token, commande.id);
      else return;

      setCommandes((prev: CommandeClient[]) => prev.map((c: CommandeClient) => c.id === updated.id ? { ...c, ...updated } : c));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de l\'action');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = commandes.filter((c: CommandeClient) =>
    activeFilter === 'ALL' ? true : c.statutCommande === activeFilter
  );

  // Counts par statut
  const counts = commandes.reduce((acc: Record<string, number>, c: CommandeClient) => {
    acc[c.statutCommande] = (acc[c.statutCommande] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              Commandes clients
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {commandes.length} commande{commandes.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCommandes} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Actualiser
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(STATUT_CONFIG) as StatutCommandeClient[]).map(statut => {
            const cfg = STATUT_CONFIG[statut];
            const count = counts[statut] ?? 0;
            return (
              <button
                key={statut}
                onClick={() => setActiveFilter(statut)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-all hover:shadow-sm',
                  cfg.bg, cfg.border,
                  activeFilter === statut && 'ring-2 ring-primary ring-offset-1'
                )}
              >
                <p className={cn('text-2xl font-bold', cfg.color)}>{count}</p>
                <p className={cn('text-xs font-medium mt-0.5', cfg.color)}>{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {tab.label}
              {tab.value !== 'ALL' && counts[tab.value] != null && (
                <span className="ml-1.5 text-xs opacity-75">({counts[tab.value]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Error global */}
        {actionError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm flex items-center justify-between">
            {actionError}
            <button onClick={() => setActionError(null)} className="ml-4 hover:opacity-70">✕</button>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center text-destructive">
              <p className="font-medium">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchCommandes}>Réessayer</Button>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Aucune commande{activeFilter !== 'ALL' ? ` avec le statut « ${STATUT_CONFIG[activeFilter as StatutCommandeClient]?.label} »` : ''}</p>
              {activeFilter !== 'ALL' && (
                <Button variant="ghost" className="mt-3" onClick={() => setActiveFilter('ALL')}>
                  Voir toutes les commandes
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((commande: CommandeClient) => (
              <CommandeCard
                key={commande.id}
                commande={commande}
                isExpanded={expandedId === commande.id}
                onToggle={() => setExpandedId(expandedId === commande.id ? null : commande.id)}
                onAction={handleAction}
                isActionLoading={actionLoading === commande.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// CommandeCard
// ============================================================================

function CommandeCard({
  commande,
  isExpanded,
  onToggle,
  onAction,
  isActionLoading,
}: {
  commande: CommandeClient;
  isExpanded: boolean;
  onToggle: () => void;
  onAction: (commande: CommandeClient, action: string) => void;
  isActionLoading: boolean;
}) {
  const cfg = STATUT_CONFIG[commande.statutCommande];
  const nextAction = NEXT_ACTION[commande.statutCommande];
  const canCancel = !['LIVREE', 'ANNULEE', 'EXPEDIEE'].includes(commande.statutCommande);
  const currentStepIndex = PROGRESS_STEPS.indexOf(commande.statutCommande);
  const isCancelled = commande.statutCommande === 'ANNULEE';

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (d?: string | null) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={cn('transition-all', isExpanded && 'ring-1 ring-primary/30')}>
      {/* Header cliquable */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
          {/* Numéro + date */}
          <div>
            <p className="text-xs text-muted-foreground">Commande</p>
            <p className="font-mono font-semibold text-sm truncate">{commande.numero}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(commande.dateCommande)} {formatTime(commande.dateCommande)}
            </p>
          </div>

          {/* Client */}
          <div>
            <p className="text-xs text-muted-foreground">Client</p>
            <p className="font-medium text-sm truncate">
              {commande.client.prenom} {commande.client.nom}
            </p>
            <p className="text-xs text-muted-foreground truncate">{commande.client.email}</p>
          </div>

          {/* Montant */}
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-bold text-sm">{Number(commande.montantTotal).toFixed(2)} €</p>
            <p className="text-xs text-muted-foreground">{commande.lignes?.length ?? '?'} article(s)</p>
          </div>

          {/* Statut */}
          <div className="flex items-start">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
              cfg.bg, cfg.color, cfg.border
            )}>
              {cfg.label}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-muted-foreground">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t px-4 pb-4 space-y-5">
          {/* Progress bar */}
          {!isCancelled && (
            <div className="pt-4">
              <div className="flex items-center gap-0">
                {PROGRESS_STEPS.map((step, i) => {
                  const stepCfg = STATUT_CONFIG[step];
                  const isDone = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const isLast = i === PROGRESS_STEPS.length - 1;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={cn(
                          'w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all',
                          isDone   ? 'bg-primary border-primary text-primary-foreground'
                          : isCurrent ? cn('border-primary', stepCfg.bg, stepCfg.color)
                          : 'border-muted-foreground/30 text-muted-foreground/50'
                        )}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className={cn(
                          'text-[10px] mt-1 font-medium whitespace-nowrap',
                          isCurrent ? stepCfg.color : isDone ? 'text-primary' : 'text-muted-foreground/50'
                        )}>
                          {stepCfg.label}
                        </span>
                      </div>
                      {!isLast && (
                        <div className={cn(
                          'flex-1 h-0.5 mx-1 mb-3',
                          i < currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/20'
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            {/* Articles */}
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Articles</h3>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Produit</th>
                      <th className="text-center px-3 py-2 font-medium text-muted-foreground">Unité</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Qté</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">P.U.</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {commande.lignes?.map(ligne => (
                      <tr key={ligne.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium">{ligne.produit?.nom}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground text-xs">
                          {ligne.uniteConditionnement?.nomCourt ?? ligne.uniteConditionnement?.nom}
                        </td>
                        <td className="px-3 py-2 text-right">{ligne.quantite}</td>
                        <td className="px-3 py-2 text-right">{Number(ligne.prixUnitaire).toFixed(2)} €</td>
                        <td className="px-3 py-2 text-right font-medium">{Number(ligne.prixTotal).toFixed(2)} €</td>
                      </tr>
                    )) ?? (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground text-xs">
                          Aucun article
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t">
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-right font-semibold">Sous-total</td>
                      <td className="px-3 py-2 text-right font-semibold">{Number(commande.sousTotal).toFixed(2)} €</td>
                    </tr>
                    {Number(commande.fraisLivraison) > 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-1 text-right text-muted-foreground text-xs">Livraison</td>
                        <td className="px-3 py-1 text-right text-muted-foreground text-xs">{Number(commande.fraisLivraison).toFixed(2)} €</td>
                      </tr>
                    )}
                    {Number(commande.montantTaxes) > 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-1 text-right text-muted-foreground text-xs">Taxes</td>
                        <td className="px-3 py-1 text-right text-muted-foreground text-xs">{Number(commande.montantTaxes).toFixed(2)} €</td>
                      </tr>
                    )}
                    <tr className="text-base">
                      <td colSpan={4} className="px-3 py-2 text-right font-bold">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-primary">{Number(commande.montantTotal).toFixed(2)} €</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Infos client + adresse + actions */}
            <div className="space-y-4">
              {/* Client */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Client</h3>
                <div className="rounded-lg border p-3 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    {commande.client.prenom} {commande.client.nom}
                  </p>
                  {commande.client.email && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{commande.client.email}</span>
                    </p>
                  )}
                  {commande.client.telephone && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      {commande.client.telephone}
                    </p>
                  )}
                </div>
              </div>

              {/* Adresse livraison */}
              {commande.adresseLivraison && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Livraison</h3>
                  <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                    <p>{commande.adresseLivraison.rue}</p>
                    <p>{commande.adresseLivraison.codePostal} {commande.adresseLivraison.ville}</p>
                    {commande.adresseLivraison.pays && <p>{commande.adresseLivraison.pays}</p>}
                  </div>
                </div>
              )}

              {/* Notes */}
              {commande.notes && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes</h3>
                  <p className="text-sm text-muted-foreground rounded-lg border p-3">{commande.notes}</p>
                </div>
              )}

              {/* Actions */}
              {!isCancelled && (
                <div className="space-y-2 pt-1">
                  {nextAction && (
                    <Button
                      className="w-full gap-2"
                      disabled={isActionLoading}
                      onClick={() => onAction(commande, nextAction.fn)}
                    >
                      {isActionLoading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : nextAction.icon}
                      {nextAction.label}
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isActionLoading}
                      onClick={() => {
                        if (window.confirm(`Annuler la commande ${commande.numero} ?`)) {
                          onAction(commande, 'annuler');
                        }
                      }}
                    >
                      {isActionLoading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <XCircle className="h-4 w-4" />}
                      Annuler la commande
                    </Button>
                  )}
                  {commande.statutCommande === 'LIVREE' && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      Commande livrée le {formatDate(commande.dateLivraison)}
                    </div>
                  )}
                </div>
              )}

              {isCancelled && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  Commande annulée
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import hashlib
import json
from datetime import datetime

User = get_user_model()


class BlockchainTransaction(models.Model):
    """Blockchain record for full transparency - immutable transaction log"""

    # Block identification
    block_index = models.PositiveIntegerField(unique=True, db_index=True)
    timestamp = models.DateTimeField(default=datetime.now, db_index=True)

    # Transaction data
    transaction_type = models.CharField(
        max_length=50,
        choices=[
            ('donation', 'Donation Received'),
            ('disbursement', 'Fund Disbursement'),
            ('program_create', 'Program Creation'),
            ('application_submit', 'Application Submission'),
            ('application_approve', 'Application Approval'),
            ('beneficiary_add', 'Beneficiary Added'),
            ('refund', 'Refund Processed'),
        ]
    )
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)

    # Full transaction details stored as JSON
    data = models.JSONField(
        help_text="Complete transaction details including amounts, parties, and metadata"
    )

    # Blockchain cryptographic fields
    previous_hash = models.CharField(max_length=64, db_index=True)
    hash = models.CharField(max_length=64, unique=True, db_index=True)
    nonce = models.PositiveIntegerField(default=0)

    # Mining difficulty (for proof of work)
    difficulty = models.PositiveIntegerField(default=4, help_text="Number of leading zeros required")

    # Related entities (for easier querying)
    program = models.ForeignKey(
        'programs.Program',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blockchain_records'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blockchain_records',
        help_text="User associated with this transaction"
    )

    # Verification status
    is_verified = models.BooleanField(default=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_blocks'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['block_index']
        indexes = [
            models.Index(fields=['hash']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['block_index']),
            models.Index(fields=['-timestamp']),
            models.Index(fields=['transaction_type', '-timestamp']),
        ]
        verbose_name = "Blockchain Transaction"
        verbose_name_plural = "Blockchain Transactions"

    def __str__(self):
        return f"Block #{self.block_index}: {self.transaction_type} ({self.transaction_id})"

    def calculate_hash(self):
        """Calculate SHA-256 hash for this block"""
        block_data = {
            'index': self.block_index,
            'timestamp': self.timestamp.isoformat(),
            'transaction_type': self.transaction_type,
            'transaction_id': self.transaction_id,
            'data': self.data,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
        }
        block_string = json.dumps(block_data, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self):
        """
        Mine block using proof of work
        Finds nonce that produces hash with required number of leading zeros
        """
        target = '0' * self.difficulty
        while not self.hash.startswith(target):
            self.nonce += 1
            self.hash = self.calculate_hash()

    def save(self, *args, **kwargs):
        """Override save to automatically calculate hash if not set"""
        if not self.hash:
            self.hash = self.calculate_hash()
        super().save(*args, **kwargs)

    def verify_hash(self):
        """Verify that the block's hash is correct"""
        return self.hash == self.calculate_hash()

    def verify_chain_link(self):
        """Verify that this block correctly links to previous block"""
        if self.block_index == 0:
            return self.previous_hash == '0'  # Genesis block

        try:
            previous_block = BlockchainTransaction.objects.get(block_index=self.block_index - 1)
            return self.previous_hash == previous_block.hash
        except BlockchainTransaction.DoesNotExist:
            return False

    @classmethod
    def get_latest_block(cls):
        """Get the most recent block in the chain"""
        return cls.objects.order_by('-block_index').first()

    @classmethod
    def get_next_block_index(cls):
        """Get the next available block index"""
        latest = cls.get_latest_block()
        return (latest.block_index + 1) if latest else 0

    @classmethod
    def create_genesis_block(cls):
        """Create the first block in the blockchain"""
        if cls.objects.exists():
            return cls.objects.get(block_index=0)

        genesis = cls.objects.create(
            block_index=0,
            transaction_type='program_create',
            transaction_id='GENESIS-BLOCK',
            data={
                'message': 'ImpactNet Blockchain Genesis Block',
                'purpose': 'Initialize transparent transaction tracking system',
                'created_at': datetime.now().isoformat(),
            },
            previous_hash='0',
            hash='0' * 64,  # Special genesis hash
        )
        return genesis

    @classmethod
    def verify_chain_integrity(cls):
        """
        Verify entire blockchain integrity
        Returns (is_valid, errors_list)
        """
        errors = []
        blocks = cls.objects.order_by('block_index')

        for block in blocks:
            # Verify hash calculation
            if not block.verify_hash():
                errors.append(f"Block {block.block_index}: Invalid hash")

            # Verify chain link
            if not block.verify_chain_link():
                errors.append(f"Block {block.block_index}: Broken chain link")

        return (len(errors) == 0, errors)


class TransactionChain(models.Model):
    """
    Transaction chain linking for graph visualization
    Links related transactions to show money flow
    """
    from_transaction = models.ForeignKey(
        BlockchainTransaction,
        on_delete=models.CASCADE,
        related_name='outgoing_links'
    )
    to_transaction = models.ForeignKey(
        BlockchainTransaction,
        on_delete=models.CASCADE,
        related_name='incoming_links'
    )

    # Amount transferred in this link
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='NGN')

    # Link metadata
    link_type = models.CharField(
        max_length=50,
        choices=[
            ('direct', 'Direct Transfer'),
            ('split', 'Split Disbursement'),
            ('consolidation', 'Funds Consolidation'),
            ('refund', 'Refund Flow'),
        ],
        default='direct'
    )

    # Description
    description = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['from_transaction', '-created_at']),
            models.Index(fields=['to_transaction', '-created_at']),
        ]
        unique_together = [['from_transaction', 'to_transaction']]

    def __str__(self):
        return f"{self.from_transaction.transaction_id} → {self.to_transaction.transaction_id} ({self.amount} {self.currency})"

    @classmethod
    def build_transaction_graph(cls, program_id=None):
        """
        Build transaction graph data for visualization
        Returns nodes and edges in format suitable for D3.js
        """
        if program_id:
            chains = cls.objects.filter(
                from_transaction__program_id=program_id
            ).select_related('from_transaction', 'to_transaction')
        else:
            chains = cls.objects.all().select_related('from_transaction', 'to_transaction')

        # Build nodes (unique transactions)
        nodes = {}
        for chain in chains:
            for tx in [chain.from_transaction, chain.to_transaction]:
                if tx.id not in nodes:
                    nodes[tx.id] = {
                        'id': str(tx.id),
                        'transaction_id': tx.transaction_id,
                        'type': tx.transaction_type,
                        'timestamp': tx.timestamp.isoformat(),
                        'data': tx.data,
                    }

        # Build edges (links)
        edges = []
        for chain in chains:
            edges.append({
                'source': str(chain.from_transaction.id),
                'target': str(chain.to_transaction.id),
                'amount': float(chain.amount),
                'currency': chain.currency,
                'type': chain.link_type,
            })

        return {
            'nodes': list(nodes.values()),
            'edges': edges,
        }


class BlockchainAuditLog(models.Model):
    """
    Audit log for blockchain operations
    Records all attempts to modify or query the blockchain
    """
    action = models.CharField(
        max_length=50,
        choices=[
            ('block_create', 'Block Created'),
            ('block_verify', 'Block Verified'),
            ('chain_verify', 'Chain Integrity Check'),
            ('query', 'Blockchain Query'),
            ('tampering_detected', 'Tampering Detected'),
        ]
    )

    # Related block (if applicable)
    block = models.ForeignKey(
        BlockchainTransaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )

    # User who performed action
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blockchain_actions'
    )

    # Details
    details = models.JSONField(help_text="Full details of the action")

    # Result
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)

    # IP address tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.action} at {self.timestamp} by {self.user}"


class BlockchainStats(models.Model):
    """
    Cached blockchain statistics for dashboard
    Updated periodically via Celery task
    """
    # Total counts
    total_blocks = models.PositiveIntegerField(default=0)
    total_transactions = models.PositiveIntegerField(default=0)
    total_programs = models.PositiveIntegerField(default=0)

    # Financial totals
    total_donations = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_disbursements = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_refunds = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    # Integrity check
    chain_integrity_verified = models.BooleanField(default=True)
    last_integrity_check = models.DateTimeField(null=True, blank=True)

    # Timestamp
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Blockchain Statistics"
        verbose_name_plural = "Blockchain Statistics"

    def __str__(self):
        return f"Blockchain Stats (Updated: {self.last_updated})"

    @classmethod
    def get_or_create_stats(cls):
        """Get existing stats or create new one"""
        stats, created = cls.objects.get_or_create(id=1)
        return stats

    def refresh_stats(self):
        """Recalculate all statistics from blockchain"""
        from django.db.models import Count, Sum, Q

        # Block and transaction counts
        self.total_blocks = BlockchainTransaction.objects.count()
        self.total_transactions = BlockchainTransaction.objects.exclude(
            transaction_type='program_create'
        ).count()

        # Program count
        self.total_programs = BlockchainTransaction.objects.filter(
            transaction_type='program_create'
        ).count()

        # Financial totals
        donations_sum = BlockchainTransaction.objects.filter(
            transaction_type='donation'
        ).aggregate(
            total=Sum('data__amount')
        )['total'] or 0

        disbursements_sum = BlockchainTransaction.objects.filter(
            transaction_type='disbursement'
        ).aggregate(
            total=Sum('data__amount')
        )['total'] or 0

        refunds_sum = BlockchainTransaction.objects.filter(
            transaction_type='refund'
        ).aggregate(
            total=Sum('data__amount')
        )['total'] or 0

        self.total_donations = donations_sum
        self.total_disbursements = disbursements_sum
        self.total_refunds = refunds_sum

        # Verify chain integrity
        is_valid, errors = BlockchainTransaction.verify_chain_integrity()
        self.chain_integrity_verified = is_valid
        self.last_integrity_check = datetime.now()

        self.save()
